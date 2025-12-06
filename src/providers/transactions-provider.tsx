"use client";

import { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import type { Transaction } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { addPendingTransaction, triggerSync } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';


interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'balance'> & { date: Date }) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearTransactions: () => void;
  getLatestBalance: () => number;
  isOffline: boolean;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [isOffline, setIsOffline] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus(); // Set initial status

    // When the app comes back online, we want to try to sync.
    const handleOnline = () => {
        toast({ title: 'Vous êtes de nouveau en ligne', description: 'Synchronisation des transactions en attente...' });
        triggerSync();
    }
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('online', handleOnline);
    };
  }, [toast]);

  const getLatestBalance = useCallback(() => {
    if (transactions.length === 0) {
      return 0;
    }
    return transactions[0].balance;
  }, [transactions]);


  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'date' | 'balance'> & { date: Date }) => {
    const newTransactionId = crypto.randomUUID();
    const transactionData = {
        ...transaction,
        id: newTransactionId,
        date: transaction.date.toISOString(),
    };

    if (isOffline) {
        await addPendingTransaction({
            id: newTransactionId,
            type: 'add',
            payload: transactionData
        });
        triggerSync();
        toast({
            title: "Vous êtes hors ligne",
            description: "La transaction a été enregistrée et sera synchronisée lorsque vous serez de nouveau en ligne.",
        });
        // Optimistically update UI
        setTransactions(prev => {
            const tempTransaction: Transaction = {
                ...transactionData,
                balance: 0 // Will be recalculated on sync
            };
            return [tempTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
        return;
    }

    setTransactions(prevTransactions => {
        const updatedTransactions = [{...transactionData, balance: 0}, ...prevTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const recalculatedTransactions: Transaction[] = [];
        let runningBalance = 0;
        for (const t of [...updatedTransactions].reverse()) {
            runningBalance = t.type === 'income' ? runningBalance + t.amount : runningBalance - t.amount;
            recalculatedTransactions.push({ ...t, balance: runningBalance });
        }

        return recalculatedTransactions.reverse();
    });

  }, [transactions, setTransactions, isOffline, toast]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (isOffline) {
        await addPendingTransaction({
            id: id,
            type: 'delete',
            payload: { id }
        });
        triggerSync();
        toast({
            title: "Vous êtes hors ligne",
            description: "La suppression de la transaction a été enregistrée et sera synchronisée lorsque vous serez de nouveau en ligne.",
        });
        // Optimistically update UI
        setTransactions(prev => prev.filter(t => t.id !== id));
        return;
    }
    
    setTransactions(prevTransactions => {
        const remainingTransactions = prevTransactions.filter(t => t.id !== id);
    
        const recalculatedTransactions: Transaction[] = [];
        let runningBalance = 0;
        for (const t of [...remainingTransactions].reverse()) {
            runningBalance = t.type === 'income' ? runningBalance + t.amount : runningBalance - t.amount;
            recalculatedTransactions.push({ ...t, balance: runningBalance });
        }
        return recalculatedTransactions.reverse();
    });
  }, [transactions, setTransactions, isOffline, toast]);

  const clearTransactions = useCallback(() => {
    setTransactions([]);
  }, [setTransactions]);

  const value = useMemo(() => ({
    transactions,
    addTransaction,
    deleteTransaction,
    clearTransactions,
    getLatestBalance,
    isOffline,
  }), [transactions, addTransaction, deleteTransaction, clearTransactions, getLatestBalance, isOffline]);

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
