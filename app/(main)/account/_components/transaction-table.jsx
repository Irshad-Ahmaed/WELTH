"use client";
import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { categoryColors } from '@/app/data/categories';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Clock, MoreHorizontalIcon, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly"
};

const TransactionsTable = ({ transactions }) => {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  const [searchTerms, setSearchTerms] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Search Functionality
    if (searchTerms) {
      const searchLower = searchTerms.toLowerCase();
      result = result.filter((transaction) => transaction.description?.toLowerCase().includes(searchLower));
    };

    // Type Filter
    if (typeFilter) {
      result = result.filter((transaction) =>
        transaction.type === typeFilter
      );
    };

    // Recurring Filter
    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === 'recurring') return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    };

    // Apply Sorting:
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;

        default:
          comparison = 0;
      }
      
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerms, typeFilter, recurringFilter, sortConfig]);

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction: current.field == field && current.direction == "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelectedIds(current => current.includes(id) ? current.filter(item => item != id) : [...current, id]);
  };

  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === filteredAndSortedTransactions.length ?
        []
        :
        filteredAndSortedTransactions.map((t) => t.id)
    );
  };

  const handleBulkDelete = () => { };

  const handleClearFilter = () => {
    setSearchTerms("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);
  };

  return (
    <div className='space-y-4'>
      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-2 top-2.5 size-4 text-muted-foreground' />
          <Input placeholder="Search transactions..." value={searchTerms}
            onChange={(e) => setSearchTerms(e.target.value)} className={'pl-8'}
          />
        </div>

        <div className='flex gap-2'>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="All transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='INCOME'>Income</SelectItem>
              <SelectItem value='EXPENSE'>Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={recurringFilter} onValueChange={(value) => setRecurringFilter(value)}>
            <SelectTrigger className={'w-[140px]'}>
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='recurring'>Recurring Only</SelectItem>
              <SelectItem value='non-recurring'>Non-recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 &&
            <div className='flex items-center gap-2'>
              <Button size={'sm'} variant={'destructive'}
                onClick={handleBulkDelete} className={'hover:backdrop-blur-lg'}>
                <Trash2 className='size-4 mr-2' /> Delete Selected({selectedIds.length})
              </Button>
            </div>
          }

          {
            (searchTerms || typeFilter || recurringFilter) && (
              <Button variant={'outline'} size={'icon'}
                onClick={handleClearFilter} title="Clear Filters">
                <X className='size-4' />
              </Button>
            )
          }
        </div>
      </div>

      {/* Transaction Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox onCheckedChange={() => handleSelectAll()}
                  checked={selectedIds.length === filteredAndSortedTransactions.length && filteredAndSortedTransactions.length > 0}
                />
              </TableHead>
              <TableHead onClick={() => handleSort("date")} className={'cursor-pointer'}>
                <div className='flex items-center'>Date {sortConfig.field == 'date' && (
                  sortConfig.direction === "asc" ? <ChevronUp className='size-4 ml-1' />
                    : <ChevronDown className='size-4 ml-1' />
                )}</div>
              </TableHead>
              <TableHead>
                Description
              </TableHead>
              <TableHead onClick={() => handleSort("category")} className={'cursor-pointer'}>
                <div className='flex items-center'>Category {sortConfig.field == 'category' && (
                  sortConfig.direction === "asc" ? <ChevronUp className='size-4 ml-1' />
                    : <ChevronDown className='size-4 ml-1' />
                )}</div>
              </TableHead>
              <TableHead onClick={() => handleSort("amount")} className={'cursor-pointer'}>
                <div className='flex items-center justify-end'>Amount {sortConfig.field == 'amount' && (
                  sortConfig.direction === "asc" ? <ChevronUp className='size-4 ml-1' />
                    : <ChevronDown className='size-4 ml-1' />
                )}</div>
              </TableHead>
              <TableHead>
                Recurring
              </TableHead>
              <TableHead className={'w-[50px]'} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTransactions.length === 0 ?
              <TableRow>
                <TableCell colSpan={7} className={'text-center text-muted-foreground'}>
                  No Transactions Found
                </TableCell>
              </TableRow>
              :

              filteredAndSortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox onCheckedChange={() => handleSelect(transaction.id)}
                      checked={selectedIds.includes(transaction.id)}
                    />
                  </TableCell>

                  <TableCell>{format(new Date(transaction.date), "PP")}</TableCell>

                  <TableCell>{transaction.description}</TableCell>

                  <TableCell className="capitalize">
                    <span style={{ background: categoryColors[transaction.category], }} className='px-2 py-1 rounded text-white text-sm'>
                      {transaction.category}
                    </span>
                  </TableCell>

                  <TableCell className="text-right font-medium" style={{ color: transaction.type === 'EXPENSE' ? 'red' : 'green' }}>
                    {transaction.type === 'EXPENSE' ? "-" : "+"}
                    ${transaction.amount.toFixed(2)}
                  </TableCell>

                  <TableCell>
                    {
                      transaction.isRecurring ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant={'outline'}
                                className='gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200'>
                                <RefreshCw className='size-3' />
                                {
                                  RECURRING_INTERVALS[
                                  transaction.recurringInterval
                                  ]
                                }
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className='flex gap-1 text-xs'>
                                <div className='font-medium'>Next Date:</div>
                                <div>
                                  {format(new Date(transaction.nextRecurringDate), "PP")}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Badge variant={'outline'} className='gap-1'>
                          <Clock className='size-3' />
                          One-time
                        </Badge>
                      )
                    }
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant={'ghost'} className={'size-8 p-0 cursor-pointer'}>
                          <MoreHorizontalIcon className='size-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => router.push(`/transaction/create?edit=${transaction.id}`)}>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className={'text-destructive'}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))

            }
          </TableBody>
        </Table>
      </div>

    </div>
  );
};

export default TransactionsTable;