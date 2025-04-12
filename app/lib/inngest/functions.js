import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";

export const checkBudgetAlert = inngest.createFunction(
    { name: "Check Budget Alerts" },
    { cron: "0 */6 * * *" },
    async ({ step }) => {
        const budgets = await step.run("fetch-budget", async () => {
            return await db.budget.findMany({
                include: {
                    user: {
                        include: {
                            accounts: {
                                where: {
                                    isDefault: true
                                },
                            },
                        },
                    },
                },
            });
        });

        // If expenses exceeds the budget then sent alert
        for (const budget of budgets) {
            const defaultAccount = budget.user.accounts[0];
            if (!defaultAccount) continue;  // skip if no default account

            await step.run(`check-budget-${budget.id}`, async () => {
                // Budget Month Logic
                const currentDate = new Date();

                const startOfMonth = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1
                );
                const endOfMonth = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    0,
                );

                const expenses = await db.transaction.aggregate({
                    where: {
                        userId: budget.userId,
                        accountId: defaultAccount.id,
                        type: 'EXPENSE',
                        date: {
                            gte: startOfMonth,
                            lte: endOfMonth,
                        },
                    },
                    _sum: {
                        amount: true,
                    },
                });

                console.log(expenses);

                const totalExpenses = expenses._sum.amount?.toNumber() || 0;
                const budgetAmount = budget.amount;
                const percentageUse = (totalExpenses/budgetAmount)*100;
                console.log(percentageUse);

                if(percentageUse >= 80 && (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), new Date))){
                    // Send the email
                    await sendEmail({
                        to: budget.user.email,
                        subject: `Budget Alert for ${defaultAccount.name}`,
                        react: EmailTemplate({
                            userName: budget.user.name,
                            type: "budget-alert",
                            data:{
                                percentageUse,
                                budgetAmount: parseInt(budgetAmount).toFixed(1),
                                totalExpenses: parseInt(totalExpenses).toFixed(1),
                                accountName: defaultAccount.name,
                            },
                        }),
                    });

                    // Update the lastAlertSent on DB
                    await db.budget.update({
                        where:{id: budget.id},
                        data: {
                            lastAlertSent: new Date(),
                        },
                    });
                }
            });
        }
    },
);

function isNewMonth(lastAlertDate, currentDate){
    return(
        lastAlertDate.getMonth() !== currentDate.getMonth() ||
        lastAlertDate.getFullYear() !== currentDate.getFullYear()
    );
}