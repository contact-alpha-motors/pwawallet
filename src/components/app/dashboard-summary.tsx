"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from '@/providers/transactions-provider';
import { ArrowDownLeft, PiggyBank } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '../ui/skeleton';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};

export function DashboardSummary() {
  const { transactions, getLatestBalance, isLoading } = useTransactions();

  const summary = useMemo(() => {
    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');
    
    let monthlyExpense = 0;

    for (const t of transactions) {
      if (t.type === 'expense') {
        if (t.date.startsWith(currentMonth)) {
            monthlyExpense += t.amount;
        }
      }
    }
    
    const balance = getLatestBalance();

    return { balance, monthlyExpense };
  }, [transactions, getLatestBalance]);

  if (isLoading) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Solde Actuel</CardTitle>
                    <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dépenses Mensuelles</CardTitle>
                    <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Solde Actuel</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.balance)}</div>
          <p className="text-xs text-muted-foreground">Vos fonds totaux disponibles</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dépenses Mensuelles</CardTitle>
          <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{formatCurrency(summary.monthlyExpense)}</div>
          <p className="text-xs text-muted-foreground">Dépenses pour {format(new Date(), 'MMMM', { locale: fr })}</p>
        </CardContent>
      </Card>
    </div>
  );
}
