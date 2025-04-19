"use client";
import { accountSchema } from "@/app/lib/schema";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import useFetch from "@/hooks/use-fetch";
import { createAccount } from "@/actions/dashboard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { revalidateDashboard } from "@/app/(main)/_components/revalidate-dashboard";

const CreateAccountDrawer = ({ children }) => {
    const [open, setOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: "",
            type: "CURRENT",
            balance: "",
            isDefault: false,
        }
    });

    const {data: newAccount, error, fn: createAccountFn, loading: createAccountLoading} = useFetch(createAccount);

    const onSubmit = async(data) => {
        console.log('data', data);
        await createAccountFn(data);
        await revalidateDashboard();
    }

    // If there is any data received 
    useEffect(()=>{
        if(newAccount && !createAccountLoading){
            toast.success("Account Created Successfully")
            reset();
            setOpen(false);
        }
    }, [createAccountLoading, newAccount]);

    // If there is any error while creating Account
    useEffect(()=>{
        if(error){
            toast.error(error.message || "Failed to create account");
        }
    }, [error])

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4">
                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Account Name</label>
                            <Input id='name' placeholder='e.g., Main checking' {...register("name")} />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>
                        {/* Account Type */}
                        <div className="space-y-2">
                            <label htmlFor="type" className="text-sm font-medium">Account Type</label>
                            <Select 
                                onValueChange={(value)=> setValue("type", value)}
                                defaultValue={watch("type")}
                            >
                                <SelectTrigger id='type' className='w-full'>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CURRENT">Current</SelectItem>
                                    <SelectItem value="SAVINGS">SAVINGS</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-sm text-red-500">{errors.type.message}</p>
                            )}
                        </div>
                        {/* balance */}
                        <div className="space-y-2">
                            <label htmlFor="balance" className="text-sm font-medium">Initial Balance</label>
                            <Input id='balance' type='number' step="0.01" placeholder='0.00' {...register("balance")} />
                            {errors.balance && (
                                <p className="text-sm text-red-500">{errors.balance.message}</p>
                            )}
                        </div>
                        {/* Set Default */}
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <label htmlFor="isDefault" className="text-sm font-medium cursor-pointer">Set as Default</label>
                                <p className="text-sm text-muted-foreground">This account will be selected by default for transactions</p>
                            </div>
                            <Switch id='isDefault' onCheckedChange={(checked)=> setValue('isDefault', checked)}
                                checked={watch("isDefault")}
                            />
                        </div>

                        <div className="flex gap-5 pt-4">
                            <DrawerClose asChild className='flex-1'>
                                <Button type='button' className={'w-full cursor-pointer'} variant={'outline'} >Cancel</Button>
                            </DrawerClose>

                            <Button type='submit' className='flex-1 cursor-pointer' disabled={createAccountLoading}>
                                {createAccountLoading ? <><Loader2 className="mr-2 size-4 animate-spin"/>Creating...</> : "Create Account"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default CreateAccountDrawer;