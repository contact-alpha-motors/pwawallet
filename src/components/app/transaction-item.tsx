"use client";

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowDownCircle, ArrowUpCircle, Trash2, Utensils, Car, Building, Tv, HeartPulse, ShoppingCart, Grip, Briefcase } from 'lucide-react';
import type { Transaction, TransactionCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/providers/transactions-provider';

interface TransactionItemProps {
  transaction: Transaction;
}

const categoryIcons: Record<TransactionCategory, React.ElementType> = {
    'Nourriture': Utensils,
    'Transport': Car,
    'Salaire': Briefcase,
    'Logement': Building,
    'Factures': Tv,
    'Divertissement': Tv,
    'Santé': HeartPulse,
    'Shopping': ShoppingCart,
    'Autre': Grip,
};


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};


export function TransactionItem({ transaction }: TransactionItemProps) {
  const { deleteTransaction } = useTransactions();
  const Icon = categoryIcons[transaction.category as TransactionCategory] || Grip;
  const isIncome = transaction.type === 'income';

  return (
    <div className="flex items-center justify-between p-3 bg-card rounded-lg border shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className={cn("hidden sm:flex h-10 w-10 items-center justify-center rounded-lg", isIncome ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50')}>
           {isIncome ? 
            <ArrowUpCircle className="h-5 w-5 text-green-600 dark:text-green-400" /> : 
            <Icon className="h-5 w-5 text-red-600 dark:text-red-400" />
           }
        </div>
        <div>
          <p className="font-semibold">{transaction.description}</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(transaction.date), 'd MMM, yyyy', { locale: fr })} &bull; {transaction.category}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className={cn('font-semibold', isIncome ? 'text-green-600' : 'text-red-600')}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => deleteTransaction(transaction.id)}
          aria-label="Supprimer la transaction"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
