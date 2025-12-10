'use client';

import type { Budget } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil } from 'lucide-react';
import { useTransactions } from '@/providers/transactions-provider';
import Link from 'next/link';
import { EditBudget } from './edit-budget';
import { useState } from 'react';

interface BudgetCardProps {
    budget: Budget & { spent: number };
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};

export function BudgetCard({ budget }: BudgetCardProps) {
    const { deleteBudget } = useTransactions();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const progress = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    const remaining = budget.amount - budget.spent;

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        deleteBudget(budget.id);
    }
    
    const handleEditClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditDialogOpen(true);
    };

    return (
        <>
            <Link href={`/budgets/${budget.id}`} className="block hover:shadow-lg transition-shadow duration-200 rounded-lg">
                <Card className="flex flex-col h-full">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <CardTitle className="text-lg font-bold">{budget.name}</CardTitle>
                        <div className="flex items-center">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEditClick}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-2xl font-bold text-red-500">{formatCurrency(budget.spent)}</p>
                        <p className="text-xs text-muted-foreground">
                            sur {formatCurrency(budget.amount)}
                        </p>
                        <Progress value={progress} className="mt-2 h-2" />
                    </CardContent>
                    <CardFooter>
                        <p className="text-sm font-medium">
                            Restant : <span className={remaining >= 0 ? "text-green-600" : "text-red-600"}>{formatCurrency(remaining)}</span>
                        </p>
                    </CardFooter>
                </Card>
            </Link>
            <EditBudget open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} budget={budget} />
        </>
    );
}
