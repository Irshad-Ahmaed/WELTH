"use client";
import { toggleGlobalBudget, updateBudget} from '@/actions/budget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import useFetch from '@/hooks/use-fetch';
import { Check, Pencil, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { revalidateDashboard } from '../../_components/revalidate-dashboard';

const BudgetProgress = ({ initialBudget, currentExpenses, account }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const percentageUse = initialBudget ? (currentExpenses / initialBudget.amount) * 100 : 0;

  const {loading: isLoading, fn: updateBudgetFn, data: updatedBudget, error} = useFetch(updateBudget);
  const {loading: isGlobalLoading, fn: updateGlobalBudgetFn, data: updatedGlobalBudget, errorGlobal} = useFetch(toggleGlobalBudget);

  const handleUpdateBudget = async() => {
    const amount = parseFloat(newBudget);
    if(isNaN(amount) || amount <=0){
      toast.error("Please enter a valid amount");
      return;
    }

    await updateBudgetFn(amount, account?.id);
    await revalidateDashboard();
  }

  const handleGlobalChange = async(budgetId, makeGlobal)=> {
    await updateGlobalBudgetFn(budgetId, makeGlobal , account?.id);
    await revalidateDashboard();
  }

  useEffect(()=> {
    if(updatedBudget?.success){
      setIsEditing(false);
      toast.success("Budget updated successfully")
    }
  }, [updatedBudget]);

  useEffect(()=> {
    if(error){
      toast.error(error.message || "Failed to update the budget")
    }
  }, [error])

  useEffect(()=> {
    if(updatedGlobalBudget?.success && updatedGlobalBudget?.message === "Global"){
      toast.success("Budget is set to Globally")
    }
    if(updatedGlobalBudget?.success && updatedGlobalBudget?.message === "NotGlobal"){
      toast.warning("Budget is not longer Globally")
    }
  }, [updatedGlobalBudget]);

  useEffect(()=> {
    if(errorGlobal){
      toast.error(errorGlobal.message || "Failed to update the budget")
    }
  }, [errorGlobal])

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  return (
    <div>
      <Card>
        <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
          <div className='flex-1'>
            <div className='flex items-center justify-between'>
              <CardTitle>Monthly Budget (Default Account)</CardTitle>
              <div>
                {initialBudget && <Switch checked={initialBudget?.isGlobal} onClick={()=>handleGlobalChange(initialBudget?.id, !initialBudget?.isGlobal)} disabled={isGlobalLoading} className='cursor-pointer hover:shadow-blue-500 transition-shadow'/>}
              </div>
            </div>
            <div className='flex items-center gap-2 mt-1'>
              {isEditing ?
                <div className='flex items-center gap-2'>
                  <Input type={'number'} value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className='w-36'
                    placeholder="Enter Amount"
                    autoFocus
                    disabled={isLoading}
                  />
                  <Button variant={'ghost'} size={'icon'} onClick={handleUpdateBudget} disabled={isLoading}>
                    <Check className='size-4 text-green-500' />
                  </Button>
                  <Button variant={'ghost'} size={'icon'} onClick={handleCancel} disabled={isLoading}>
                    <X className='size-4 text-red-500' />
                  </Button>
                </div>
                :
                <>
                  <CardDescription>
                    {initialBudget
                      ? `$${currentExpenses.toFixed(2)} of $${initialBudget.amount.toFixed(2)} spent`
                      : "No Budget Set"
                    }
                  </CardDescription>
                  <Button variant={'ghost'} size={'icon'} className={'size-6'} onClick={() => setIsEditing(true)}>
                    <Pencil className='size-3' />
                  </Button>
                </>
              }
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {initialBudget &&
            <div className='space-y-2'>
              <Progress value={percentageUse} 
                extraStyles={`${
                  percentageUse >=90
                  ? "bg-red-500"
                  : percentageUse >= 75
                  ? "bg-yellow-500"
                  : "bg-green-500"
                }`}
              />

              <p className='text-sm text-muted-foreground text-right'>
                {percentageUse.toFixed(1)}% used
              </p>
            </div>
          }
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetProgress;