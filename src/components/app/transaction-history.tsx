"use client";

import { useTransactions } from '@/providers/transactions-provider';
import { TransactionItem } from './transaction-item';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';

export function TransactionHistory() {
  const { transactions } = useTransactions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p>No transactions yet.</p>
            <p>Click the '+' button to add your first one!</p>
          </div>
        ) : (
          <ul className="space-y-4">
             <AnimatePresence>
              {transactions.map((transaction) => (
                <motion.li
                  key={transaction.id}
                  layout
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                >
                  <TransactionItem transaction={transaction} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
