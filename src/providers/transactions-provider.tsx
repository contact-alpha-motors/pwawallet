"use client";

import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Transaction, TransactionType, TransactionCategory } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'> & { date: Date }) => void;
  deleteTransaction: (id: string) => void;
  clearTransactions: () => void;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'date'> & { date: Date }) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: transaction.date.toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [setTransactions]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [setTransactions]);

  const clearTransactions = useCallback(() => {
    setTransactions([]);
  }, [setTransactions]);

  const value = useMemo(() => ({
    transactions,
    addTransaction,
    deleteTransaction,
    clearTransactions,
  }), [transactions, addTransaction, deleteTransaction, clearTransactions]);

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
}
