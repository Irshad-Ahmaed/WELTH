"use server";

import { serializedTransaction } from "@/app/lib/serializedTransaction";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateDefaultAccount(accountId) {
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

        await db.account.updateMany({
            where: { userId: user.id, isDefault: true },
            data: { isDefault: false },
        });

        const account = await db.account.update({
            where:{id: accountId, userId: user.id},
            data:{isDefault: true}
        });

        // revalidatePath('/dashboard');
        return {success: true, data: serializedTransaction(account)};
    } catch (error) {
        return {success: false, error: error.message};
    }
}

export async function getAccountWithTransactions(accountId) {
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

        const account = await db.account.findUnique({
            where:{id: accountId, userId: user.id},
            include:{
                transactions:{
                    orderBy: {date: "desc"},
                },
                _count:{
                    select: {transactions: true},
                },
            },
        });

        if(!account) return null;

        return{
            ...serializedTransaction(account),
            transactions: account.transactions.map(serializedTransaction)
        }
    } catch (error) {
        return {success: false, error: error.message};
    }
}

export async function bulkDeleteTransactions(transactionIds) {
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

        const transactions = await db.transaction.findMany({
            where:{
                id: {in: transactionIds},
                userId: user.id,
            },
        });

        // Calculating Amount changes when transaction deleted. Ex: If delete 1 transaction we need to update the balance, 
        // if expense we add the balance otherwise deduct the balance
        const accountBalanceChanges = transactions.reduce((acc, transaction)=>{
            const change = transaction.type === "EXPENSE" ? transaction.amount : -transaction.amount;
            console.log('change', change);
            acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
            return acc;
        }, {});

        // Deleting Transactions and updating the account balances in a transaction
        await db.$transaction(async(tx)=>{ // This $transaction is a Prisma function which let you call different api's inside it
            // Deleting Transactions
            await tx.transaction.deleteMany({
                where:{
                    id: {in: transactionIds},
                    userId: user.id,
                },
            });

            // Already Calculated the Amount in "accountBalanceChanges" just updating the database
            for(const[accountId, balanceChange] of Object.entries(accountBalanceChanges)){
                await tx.account.update({
                    where: {id: accountId},
                    data: {
                        balance:{
                            increment: balanceChange,
                        },
                    },
                });
            }
        });

        revalidatePath('/dashboard');
        revalidatePath('/account/[id]');

        return {success: true};
    } catch (error) {
        return {success: false, error: error.message};
    }
}