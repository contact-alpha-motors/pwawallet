"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from '@/providers/transactions-provider';
import { ArrowDownLeft, PiggyBank, Target } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Budget } from '@/lib/types';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};

export function DashboardSummary() {
  const { transactions, getLatestBalance, isLoading, budgets, budgetsLoading } = useTransactions();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  const selectedBudget = useMemo(() => {
    if (!selectedBudgetId) return null;
    return budgets.find(b => b.id === selectedBudgetId) || null;
  }, [selectedBudgetId, budgets]);

  const summary = useMemo(() => {
    const balance = getLatestBalance();
    
    if (!selectedBudget) {
      return { balance, expense: 0, budgetAmount: 0 };
    }

    const budgetExpenses = transactions
      .filter(t => t.budgetId === selectedBudget.id && t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    return { balance, expense: budgetExpenses, budgetAmount: selectedBudget.amount };
  }, [transactions, getLatestBalance, selectedBudget]);

  const budgetProgress = useMemo(() => {
    if (!summary.budgetAmount) return 0;
    return (summary.expense / summary.budgetAmount) * 100;
  }, [summary.expense, summary.budgetAmount]);

  if (isLoading || budgetsLoading) {
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
                    <CardTitle className="text-sm font-medium">Suivi du Budget</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-full mb-2" />
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
          <CardTitle className="text-sm font-medium">Suivi du Budget</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedBudgetId} defaultValue={selectedBudgetId || undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un budget" />
            </SelectTrigger>
            <SelectContent>
              {budgets.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedBudget ? (
            <div className="mt-4">
              <div className="text-2xl font-bold text-red-500">{formatCurrency(summary.expense)}</div>
              <p className="text-xs text-muted-foreground">
                dépensé sur un budget de {formatCurrency(summary.budgetAmount)}
              </p>
              <Progress value={budgetProgress} className="mt-2 h-2" />
            </div>
          ) : (
             <p className="text-sm text-muted-foreground mt-4">Veuillez sélectionner un budget pour voir le suivi.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
