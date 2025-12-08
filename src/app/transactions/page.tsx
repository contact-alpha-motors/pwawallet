'use client';
import { useMemo } from 'react';
import { useTransactions } from '@/providers/transactions-provider';
import { SiteHeader } from '@/components/app/site-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Transaction, Budget } from '@/lib/types';
import { AddTransaction } from '@/components/app/add-transaction';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};

interface GroupedTransactions {
    budget: Budget | { id: string; name: string };
    transactions: Transaction[];
}

export default function AllTransactionsPage() {
  const { transactions, budgets, isLoading } = useTransactions();

  const groupedTransactions = useMemo(() => {
    if (!transactions || !budgets) return [];

    const groups: { [key: string]: GroupedTransactions } = {};

    // Initialize groups for all budgets
    budgets.forEach(budget => {
        groups[budget.id] = { budget, transactions: [] };
    });

    // Initialize a group for unbudgeted transactions
    groups['unbudgeted'] = { budget: { id: 'unbudgeted', name: 'Hors budget' }, transactions: [] };

    // Group transactions
    transactions.forEach(t => {
        const key = t.budgetId || 'unbudgeted';
        if (groups[key]) {
            groups[key].transactions.push(t);
        } else {
             // This case should ideally not happen if all budgets are loaded
            groups['unbudgeted'].transactions.push(t);
        }
    });

    // Filter out budget groups with no transactions
    return Object.values(groups).filter(group => group.transactions.length > 0);

  }, [transactions, budgets]);


  if (isLoading) {
    return (
        <div className="flex flex-col min-h-dvh bg-background font-body">
            <SiteHeader />
            <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
                <h1 className="text-2xl font-bold">Toutes les transactions</h1>
                <div className="space-y-8">
                   {[...Array(2)].map((_, i) => (
                       <Card key={i}>
                           <CardHeader>
                               <Skeleton className="h-7 w-48" />
                           </CardHeader>
                           <CardContent>
                               <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {[...Array(7)].map((_, j) => <TableHead key={j}><Skeleton className="h-6 w-full" /></TableHead>)}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {[...Array(3)].map((_, k) => (
                                                <TableRow key={k}>
                                                    <TableCell colSpan={7}>
                                                        <Skeleton className="h-8 w-full" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                               </div>
                           </CardContent>
                       </Card>
                   ))}
                </div>
            </main>
            <AddTransaction />
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background font-body">
      <SiteHeader />
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <h1 className="text-2xl font-bold">Toutes les transactions</h1>

        {groupedTransactions.length === 0 && !isLoading ? (
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                <p>Aucune transaction pour le moment.</p>
            </div>
        ) : (
            <div className="space-y-8">
                {groupedTransactions.map(({ budget, transactions: groupTransactions }) => (
                    <Card key={budget.id}>
                        <CardHeader>
                            <CardTitle className="text-xl">
                               {budget.id === 'unbudgeted' ? (
                                    'Hors budget'
                                ) : (
                                    <Link href={`/budgets/${budget.id}`} className="hover:underline">
                                        Budget: {budget.name}
                                    </Link>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Bénéficiaire</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Catégorie</TableHead>
                                        <TableHead>Domaine</TableHead>
                                        <TableHead className="text-right">Montant</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {groupTransactions.map((t: Transaction) => (
                                        <TableRow key={t.id}>
                                            <TableCell>{format(new Date(t.date), 'd MMM yyyy', { locale: fr })}</TableCell>
                                            <TableCell>
                                            <Badge variant={t.type === 'income' ? 'secondary' : 'destructive'}>
                                                {t.type === 'income' ? 'Revenu' : 'Dépense'}
                                            </Badge>
                                            </TableCell>
                                            <TableCell>{t.beneficiary}</TableCell>
                                            <TableCell>{t.description}</TableCell>
                                            <TableCell>{t.category}</TableCell>
                                            <TableCell>{t.domain}</TableCell>
                                            <TableCell className={cn(
                                                'text-right font-medium',
                                                t.type === 'income' ? 'text-green-600' : 'text-red-600'
                                            )}>
                                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                            </TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </main>
      <AddTransaction />
    </div>
  );
}
