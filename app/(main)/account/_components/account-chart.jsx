"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { endOfDay, format, startOfDay, subDays } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const DATES_RANGES = {
    "7D": { label: "Last 7 Days", days: 7 },
    "1M": { label: "Last 1 Month", days: 30 },
    "3M": { label: "Last 3 Months", days: 90 },
    "6M": { label: "Last 6 Months", days: 180 },
    ALL: { label: "All times", days: null },
};

const AccountChart = ({ transactions }) => {
    const [dateRange, setDateRange] = useState("1M");

    const filteredData = useMemo(() => {
        const range = DATES_RANGES[dateRange];
        const now = new Date();
        const startDate = range.days
            ? startOfDay(subDays(now, range.days)) // From current date it reduce given number od days ex: From today it reduce 1M means 30 days 
            : startOfDay(new Date(0)); // When range.days == null, it provide all the data

        // Filter transactions within date range 
        const filtered = transactions.filter((t) =>
            new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now)
        );

        const grouped = filtered.reduce((acc, transaction) => {
            const date = format(new Date(transaction.date), "MMM dd");

            if (!acc[date]) {
                acc[date] = { date, income: 0, expense: 0 };
            }

            if (transaction.type === 'INCOME') {
                acc[date].income += transaction.amount;
            } else {
                acc[date].expense += transaction.amount;
            }

            return acc;
        }, {});

        // Convert to array and sort by date
        return Object.values(grouped).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

    }, [transactions, dateRange]);

    console.log('filteredData', filteredData);

    const totals = useMemo(() => {
        return filteredData.reduce((acc, day) => ({
            income: acc.income + day.income,
            expense: acc.expense + day.expense,
        }),
            { income: 0, expense: 0 }
        );
    }, [filteredData]);

    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-7'>
                <CardTitle className='text-base font-normal'>Transaction Overview</CardTitle>
                <Select defaultValue={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className={'w-[140px]'}>
                        <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(DATES_RANGES).map(([key, { label }]) => { // {} using this then you need return statement. if not using {} you don't need return statement
                            return <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>;
                        })}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className='flex items-center justify-around pb-6 text-sm'>
                    <div className='text-center'>
                        <p className='text-muted-foreground'>Total Income</p>
                        <p className='text-lg font-bold text-green-500'>${totals.income.toFixed(2)}</p>
                    </div>
                    <div className='text-center'>
                        <p className='text-muted-foreground'>Total Expenses</p>
                        <p className='text-lg font-bold text-red-500'>${totals.expense.toFixed(2)}</p>
                    </div>
                    <div className='text-center'>
                        <p className='text-muted-foreground'>Net</p>
                        <p className={`text-lg font-bold text-green-500 ${totals.income - totals.expense >= 0 ? 'text-green-500' : 'text-red-500'}`}>${(totals.income - totals.expense).toFixed(2)}</p>
                    </div>
                </div>

                {/* Charts */}
                <div className='h-[300px]'>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={filteredData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 10,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis 
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value)=> `$${value}`} 
                            />
                            <Tooltip formatter={(value)=> [`$${value}`, undefined]} />
                            <Legend />
                            <Bar dataKey="income" name='Income' fill="#22c55e" radius={[4,4,0,0]} />
                            <Bar dataKey="expense" name='Expense' fill="#ef4444" radius={[4,4,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default AccountChart;