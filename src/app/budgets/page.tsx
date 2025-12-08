'use client';

import { useMemo } from 'react';
import { useTransactions } from '@/providers/transactions-provider';
import { SiteHeader } from '@/components/app/site-header';
import { AddBudget } from '@/components/app/budgets/add-budget';
import { BudgetCard } from '@/components/app/budgets/budget-card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';

export default function BudgetsPage() {
  const { budgets, transactions, budgetsLoading } = useTransactions();

  const budgetsWithExpenses = useMemo(() => {
    return budgets.map(budget => {
      const expenses = transactions
        .filter(t => t.budgetId === budget.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...budget, spent: expenses };
    });
  }, [budgets, transactions]);


  return (
    <div className="flex flex-col min-h-dvh bg-background font-body">
      <SiteHeader />
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Mes Budgets</h1>
        </div>

        {budgetsLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        )}

        {!budgetsLoading && budgets.length === 0 && (
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                <p>Aucun budget pour le moment.</p>
                <p>Cliquez sur le bouton '+' pour créer votre premier budget !</p>
            </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
                {budgetsWithExpenses.map(budget => (
                    <motion.div
                        key={budget.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    >
                        <BudgetCard budget={budget} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

      </main>
      <AddBudget />
    </div>
  );
}
