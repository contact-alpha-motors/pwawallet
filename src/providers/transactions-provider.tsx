"use client";

import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Transaction } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'balance'> & { date: Date }) => void;
  deleteTransaction: (id: string) => void;
  clearTransactions: () => void;
  getLatestBalance: () => number;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);

  const getLatestBalance = useCallback(() => {
    if (transactions.length === 0) {
      return 0;
    }
    // Transactions are sorted by date descending, so the first one is the latest
    return transactions[0].balance;
  }, [transactions]);


  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'date' | 'balance'> & { date: Date }) => {
    const latestBalance = transactions.length > 0 ? transactions[0].balance : 0;
    
    const newBalance = transaction.type === 'income' 
      ? latestBalance + transaction.amount 
      : latestBalance - transaction.amount;

    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: transaction.date.toISOString(),
      balance: newBalance,
    };
    
    const updatedTransactions = [newTransaction, ...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Recalculate balances from the oldest to the newest
    const recalculatedTransactions: Transaction[] = [];
    let runningBalance = 0;
    // We need to iterate from oldest to newest to recalculate balances correctly.
    // So we reverse the array.
    for (const t of [...updatedTransactions].reverse()) {
        runningBalance = t.type === 'income' ? runningBalance + t.amount : runningBalance - t.amount;
        recalculatedTransactions.push({ ...t, balance: runningBalance });
    }

    // Sort back to descending date order for display
    setTransactions(recalculatedTransactions.reverse());

  }, [transactions, setTransactions]);

  const deleteTransaction = useCallback((id: string) => {
    const remainingTransactions = transactions.filter(t => t.id !== id);
    
    // Recalculate balances after deletion
    const recalculatedTransactions: Transaction[] = [];
    let runningBalance = 0;
    for (const t of [...remainingTransactions].reverse()) {
        runningBalance = t.type === 'income' ? runningBalance + t.amount : runningBalance - t.amount;
        recalculatedTransactions.push({ ...t, balance: runningBalance });
    }

    setTransactions(recalculatedTransactions.reverse());
  }, [transactions, setTransactions]);

  const clearTransactions = useCallback(() => {
    setTransactions([]);
  }, [setTransactions]);

  const value = useMemo(() => ({
    transactions,
    addTransaction,
    deleteTransaction,
    clearTransactions,
    getLatestBalance,
  }), [transactions, addTransaction, deleteTransaction, clearTransactions, getLatestBalance]);

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
