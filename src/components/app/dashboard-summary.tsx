"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from '@/providers/transactions-provider';
import { ArrowDownLeft, ArrowUpRight, PiggyBank } from 'lucide-react';
import { format } from 'date-fns';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export function DashboardSummary() {
  const { transactions } = useTransactions();

  const summary = useMemo(() => {
    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');
    
    let totalIncome = 0;
    let totalExpense = 0;
    let monthlyExpense = 0;

    for (const t of transactions) {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
        if (t.date.startsWith(currentMonth)) {
            monthlyExpense += t.amount;
        }
      }
    }
    
    const balance = totalIncome - totalExpense;

    return { balance, monthlyExpense };
  }, [transactions]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.balance)}</div>
          <p className="text-xs text-muted-foreground">Your total available funds</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{formatCurrency(summary.monthlyExpense)}</div>
          <p className="text-xs text-muted-foreground">Expenses for {format(new Date(), 'MMMM')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
