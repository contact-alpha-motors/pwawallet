"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from '@/providers/transactions-provider';
import { ArrowDownLeft, PiggyBank, Target } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '../ui/skeleton';
import { Progress } from '../ui/progress';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};

export function DashboardSummary() {
  const { transactions, getLatestBalance, isLoading, budget, budgetLoading } = useTransactions();

  const summary = useMemo(() => {
    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');
    
    let monthlyExpense = 0;

    for (const t of transactions) {
      if (t.type === 'expense') {
        const transactionDate = new Date(t.date);
        if (format(transactionDate, 'yyyy-MM') === currentMonth) {
            monthlyExpense += t.amount;
        }
      }
    }
    
    const balance = getLatestBalance();

    return { balance, monthlyExpense };
  }, [transactions, getLatestBalance]);

  const budgetProgress = useMemo(() => {
    if (!budget || budget === 0) return 0;
    return (summary.monthlyExpense / budget) * 100;
  }, [summary.monthlyExpense, budget]);

  if (isLoading || budgetLoading) {
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
                    <CardTitle className="text-sm font-medium">Budget Mensuel</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                    <Skeleton className="h-2 w-full mt-2" />
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
          <CardTitle className="text-sm font-medium">Budget Mensuel</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{formatCurrency(summary.monthlyExpense)}</div>
          {budget > 0 ? (
            <>
              <p className="text-xs text-muted-foreground">
                sur un budget de {formatCurrency(budget)} pour {format(new Date(), 'MMMM', { locale: fr })}
              </p>
              <Progress value={budgetProgress} className="mt-2 h-2" />
            </>
          ) : (
             <p className="text-xs text-muted-foreground">Aucun budget défini pour ce mois-ci.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
