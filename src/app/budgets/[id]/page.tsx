'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTransactions } from '@/providers/transactions-provider';
import { SiteHeader, exportBudgetsToExcel } from '@/components/app/site-header';
import { AddTransaction } from '@/components/app/add-transaction';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionHistory } from '@/components/app/transaction-history';
import { ArrowLeft, FileDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};

export default function BudgetDetailPage() {
    const params = useParams();
    const budgetId = params.id as string;
    const { budgets, transactions, isLoading } = useTransactions();

    const budgetDetails = useMemo(() => {
        const budget = budgets.find(b => b.id === budgetId);
        if (!budget) return null;

        const budgetTransactions = transactions.filter(t => t.budgetId === budgetId);
        const spent = budgetTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        return {
            ...budget,
            spent,
            transactions: budgetTransactions,
        };
    }, [budgetId, budgets, transactions]);

    const handleExport = () => {
        if (budgetDetails) {
            exportBudgetsToExcel(budgets, transactions, budgetId);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-dvh bg-background font-body">
                <SiteHeader />
                <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-64 w-full" />
                </main>
            </div>
        );
    }

    if (!budgetDetails) {
        return (
            <div className="flex flex-col min-h-dvh bg-background font-body">
                <SiteHeader />
                <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6 text-center">
                    <h1 className="text-2xl font-bold">Budget non trouvé</h1>
                    <p className="text-muted-foreground">Le budget que vous cherchez n'existe pas.</p>
                     <Button asChild variant="outline" className="mt-4">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour aux budgets
                        </Link>
                    </Button>
                </main>
            </div>
        );
    }
    
    const progress = budgetDetails.amount > 0 ? (budgetDetails.spent / budgetDetails.amount) * 100 : 0;
    const remaining = budgetDetails.amount - budgetDetails.spent;

    return (
        <div className="flex flex-col min-h-dvh bg-background font-body">
            <SiteHeader />
            <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon">
                            <Link href="/">
                                <ArrowLeft />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">Budget: {budgetDetails.name}</h1>
                    </div>
                    <Button variant="outline" onClick={handleExport}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Exporter
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Résumé du budget</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-red-500">{formatCurrency(budgetDetails.spent)}</p>
                        <p className="text-sm text-muted-foreground">
                            dépensé sur {formatCurrency(budgetDetails.amount)}
                        </p>
                        <Progress value={progress} className="mt-3 h-3" />
                    </CardContent>
                    <CardFooter>
                        <p className="text-base font-medium">
                            Restant : <span className={remaining >= 0 ? "text-green-600" : "text-red-600"}>{formatCurrency(remaining)}</span>
                        </p>
                    </CardFooter>
                </Card>

                <TransactionHistory transactions={budgetDetails.transactions} />

            </main>
            <AddTransaction budgetId={budgetId} />
        </div>
    );
}
