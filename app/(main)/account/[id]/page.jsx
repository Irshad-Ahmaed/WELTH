import { getAccountWithTransactions } from '@/actions/account';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';
import { BarLoader } from 'react-spinners';
import TransactionsTable from '../_components/transaction-table';

const AccountsPage = async ({ params }) => {
  const accountData = await getAccountWithTransactions(params?.id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className=''>
      <div className='flex items-end justify-between gap-4 px-5 space-y-8'>
        <div>
          <h1 className='text-5xl sm:w-6xl font-bold gradient-title capitalize'>{account.name}</h1>
          <p className='text-muted-foreground'>{account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account</p>
        </div>

        <div className='text-right pb-2'>
          <div className='text-xl sm:text-2xl font-bold'>${parseFloat(account.balance).toFixed(2)}</div>
          <p className='text-sm text-muted-foreground'>{account._count.transactions} Transactions</p>
        </div>
      </div>

      {/* Chart Section */}

      {/* Transaction Table */}
      <Suspense fallback={<BarLoader className='mt-4' width={'100%'} color='#9333ea' />}>
        <TransactionsTable transactions={transactions} />
      </Suspense>
    </div>
  );
};

export default AccountsPage;