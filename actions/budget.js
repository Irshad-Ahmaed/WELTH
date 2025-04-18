"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// export async function getCurrentBudget(accountId) {
//     try {
//         const { userId } = await auth();
//         if (!userId) {
//             throw new Error("Unauthorized");
//         }

//         const user = await db.user.findUnique({
//             where: {
//                 clerkUserId: userId,
//             }
//         });

//         if (!user) {
//             throw new Error("User not found");
//         }

//         // Finding budget in db
//         const budget = await db.budget.findFirst({
//             where: { userId: user.id },
//         });

//         // Budget Month Logic
//         const currentDate = new Date();

//         const startOfMonth = new Date(
//             currentDate.getFullYear(),
//             currentDate.getMonth(),
//             1
//         );
//         const endOfMonth = new Date(
//             currentDate.getFullYear(),
//             currentDate.getMonth() + 1,
//             0,
//         );

//         const expenses = await db.transaction.aggregate({
//             where: {
//                 userId: user.id,
//                 type: 'EXPENSE',
//                 date: {
//                     gte: startOfMonth,
//                     lte: endOfMonth,
//                 },
//                 accountId,
//             },
//             _sum: {
//                 amount: true,
//             },
//         });

//         return {
//             budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
//             currentExpense: expenses._sum.amount
//                 ? expenses._sum.amount.toNumber()
//                 : 0,
//         };

//     } catch (error) {
//         console.error("Error fetching budget", error);
//         throw error;
//     }
// }

export async function getCurrentBudget(accountId) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) throw new Error("User not found");

        // 1. Fallback to global budget if one exists
        let budget = await db.budget.findFirst({
            where: {
                userId: user.id,
                isGlobal: true,
            }

        });

        // 2. Try to get account-specific budget
        if (!budget) {
            budget = await db.budget.findFirst({
                where: {
                    userId: user.id,
                    accountId,
                }

            });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const expenses = await db.transaction.aggregate({
            where: {
                userId: user.id,
                accountId: budget ? budget.accountId : accountId,
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

        return {
            budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
            currentExpense: expenses._sum.amount?.toNumber() ?? 0,
        };
    } catch (error) {
        console.error("Error fetching budget", error);
        throw error;
    }
}


export async function updateBudget(amount, accountId) {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            }
        });

        if (!user) {
            throw new Error("User not found");
        }

        if (!accountId) {
            throw new Error("accountId is required for this action");
        }

        let budgetD = await db.budget.findFirst({
            where: {
                userId: user.id,
                isGlobal: true,
            }
        });

        let budget;

        if (budgetD) {
            budget = await db.budget.update({
                where: {
                    userId: user.id,
                    id: budgetD.id,
                    isGlobal: true,
                },
                data: {
                    amount,
                }
            });
        } else {

            budget = await db.budget.upsert({
                where: {
                    userId_accountId: {
                        userId: user.id,
                        accountId,
                    },
                },
                update: {
                    amount,
                },
                create: {
                    userId: user.id,
                    accountId,
                    isGlobal: false,
                    amount,
                },
            });
        }

        // revalidatePath('/dashboard');

        return {
            success: true,
            data: { ...budget, amount: budget.amount.toNumber() },
        };
    } catch (error) {
        console.error('Error updating budget', error);
        return { success: false, error: error.message };
    }
}

export async function toggleGlobalBudget(budgetId, makeGlobal, accountId) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) throw new Error("User not found");

        if (makeGlobal) {
            // Clear all other budgets marked as global for this user
            await db.budget.updateMany({
                where: {
                    userId: user.id,
                    NOT: {
                        id: budgetId,
                    },
                },
                data: {
                    isGlobal: false,
                },
            });

            // Make this budget the new global budget
            const updated = await db.budget.update({
                where: {
                    id: budgetId,
                    userId: user.id,
                },
                data: {
                    isGlobal: true,
                },
            });

            // revalidatePath('/dashboard');
            return {
                success: true,
                message: "Global",
                data: { ...updated, amount: updated.amount.toNumber() },
            };
        }
        // Else Part ---------------------
        else {
            let budgetD = await db.budget.findFirst({
                where: {
                    userId: user.id,
                    isGlobal: true,
                }
            });
            // Unsetting global: assign it to a specific account
            if (!budgetD?.id) throw new Error("accountId is required when unsetting global");

            const updated = await db.budget.update({
                where: {
                    userId: user.id,
                    id: budgetD?.id,
                    isGlobal: true,
                },
                data: {
                    isGlobal: false,
                },
            });

            // revalidatePath('/dashboard');
            return {
                success: true,
                message: "NotGlobal",
                data: { ...updated, amount: updated.amount.toNumber() },
            };
        }

    } catch (error) {
        console.error("Error toggling global budget:", error);
        return { success: false, error: error.message };
    }
}  