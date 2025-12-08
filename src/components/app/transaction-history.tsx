"use client";

import { useTransactions } from '@/providers/transactions-provider';
import { TransactionItem } from './transaction-item';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

interface GroupedTransactions {
  [key: string]: {
    transactions: Transaction[];
    totalExpense: number;
  };
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};

interface TransactionHistoryProps {
    transactions?: Transaction[];
}

export function TransactionHistory({ transactions: transactionsProp }: TransactionHistoryProps) {
  const { transactions: allTransactions, isLoading } = useTransactions();
  const transactions = transactionsProp || allTransactions;

  const groupedTransactions = useMemo(() => {
    return transactions.reduce((acc: GroupedTransactions, transaction) => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { transactions: [], totalExpense: 0 };
      }
      acc[date].transactions.push(transaction);
      if (transaction.type === 'expense') {
        acc[date].totalExpense += transaction.amount;
      }
      return acc;
    }, {});
  }, [transactions]);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Historique des transactions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p>Aucune transaction pour le moment.</p>
            <p>Cliquez sur le bouton '+' pour ajouter votre première transaction !</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {sortedDates.map((date) => (
                <motion.div 
                    key={date}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-muted-foreground">
                            {format(new Date(date), "EEEE, d MMMM yyyy", { locale: fr })}
                        </h3>
                        {groupedTransactions[date].totalExpense > 0 && (
                            <Badge variant="destructive">
                                Dépenses: {formatCurrency(groupedTransactions[date].totalExpense)}
                            </Badge>
                        )}
                    </div>
                    <ul className="space-y-4">
                        {groupedTransactions[date].transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((transaction) => (
                            <motion.li
                                key={transaction.id}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            >
                            <TransactionItem transaction={transaction} />
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
