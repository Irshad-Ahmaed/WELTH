import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializedTransaction = (obj)=>{
    const serialized = {...obj};

    if(obj.balance){
        serialized.balance = obj.balance.toNumber();
    }
}

export async function createAccount(data) {
    try {
        const {userId} = await auth();
        if(!userId){
            throw new Error("Unauthorized");
        }

        const user = await db.user.findUnique({
            where:{
                clerkUserId: userId,
            }
        });

        if(!user){
            throw new Error("User not found");
        }

        // Convert balance to float before saving
        const balanceFloat = parseFloat(data.balance);
        if(isNaN(balanceFloat)){
            throw new Error("Invalid balance account");
        }

        const existingAccount = await db.account.findMany({
            where:{userId: user.id}
        });

        const shouldBeDefault = existingAccount.length === 0 ? true : data.isDefault;

        // Is this account should be default, unset other default accounts
        if(shouldBeDefault){
            await db.account.updateMany({
                where: {userId: user.id, isDefault: true},
                data:{isDefault: false},
            });
        }

        const account = await db.account.create({
            data:{
                ...data,
                balance: balanceFloat,
                userId: user.id,
                isDefault: shouldBeDefault,
            },
        });

        const serializedAccount = serializedTransaction(account);

        // It's allow you to call all api calls ones again in dashboard page // Kind of refresh
        revalidatePath("/dashboard");
        return {success: true, data: serializedAccount};
    } catch (error) {
        throw new Error("Error While Creating or Fetching account details", error.message);
    }
}