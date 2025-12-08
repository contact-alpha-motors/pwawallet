"use client";

import { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import type { Transaction, TransactionFirestore } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useIsMobile } from '@/hooks/use-mobile';


interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'balance'> & { date: Date }) => void;
  deleteTransaction: (id: string) => void;
  clearTransactions: () => void;
  getLatestBalance: () => number;
  isOffline: boolean;
  isLoading: boolean;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { firestore } = useFirebase();
  const { user } = useUser();

  const transactionsQuery = useMemoFirebase(
    () => {
        if (!user || !firestore) return null;
        return collection(firestore, 'users', user.uid, 'transactions');
    },
    [user, firestore]
  );
  const { data: firestoreTransactions, isLoading } = useCollection<TransactionFirestore>(transactionsQuery);

  const [isOffline, setIsOffline] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    const handleOnline = () => {
        toast({ title: 'Vous êtes de nouveau en ligne', description: 'Synchronisation des données...' });
    }
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('online', handleOnline);
    };
  }, [toast]);

  const transactions = useMemo(() => {
    if (!firestoreTransactions) return [];

    const sorted = [...firestoreTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const withBalance: Transaction[] = [];
    let runningBalance = 0;
    
    const reversed = [...sorted].reverse();

    for(const t of reversed) {
        runningBalance = t.type === 'income' ? runningBalance + t.amount : runningBalance - t.amount;
        withBalance.push({ ...t, balance: runningBalance });
    }

    return withBalance.reverse();
  }, [firestoreTransactions]);


  const getLatestBalance = useCallback(() => {
    if (transactions.length === 0) {
      return 0;
    }
    return transactions[0].balance;
  }, [transactions]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'date' | 'balance'> & { date: Date }) => {
    if (!firestore || !user) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible d'ajouter la transaction. Utilisateur non connecté.",
        });
        return;
    }

    const newTransactionId = doc(collection(firestore, 'pids')).id;

    const transactionData: TransactionFirestore = {
        ...transaction,
        id: newTransactionId,
        date: transaction.date.toISOString(),
    };
    
    const docRef = doc(firestore, 'users', user.uid, 'transactions', newTransactionId);
    
    // We are now using the non-blocking update function
    addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'transactions'), transactionData);

    toast({
        title: "Transaction ajoutée",
        description: `${transaction.beneficiary} - ${transaction.amount}`,
    });

  }, [firestore, user, toast]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!firestore || !user) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de supprimer la transaction. Utilisateur non connecté.",
        });
        return;
    }
    const docRef = doc(firestore, 'users', user.uid, 'transactions', id);
    deleteDocumentNonBlocking(docRef);

    toast({
        title: "Transaction supprimée",
    });

  }, [firestore, user, toast]);

  const clearTransactions = useCallback(async () => {
    if (!firestore || !user || !firestoreTransactions) return;

    if (firestoreTransactions.length === 0) return;

    const batch = writeBatch(firestore);
    firestoreTransactions.forEach(t => {
        const docRef = doc(firestore, 'users', user.uid, 'transactions', t.id);
        batch.delete(docRef);
    });
    
    await batch.commit();

    toast({
        title: "Données réinitialisées",
        description: "Toutes les transactions ont été supprimées.",
    });

  }, [firestore, user, firestoreTransactions, toast]);

  const value = useMemo(() => ({
    transactions,
    addTransaction,
    deleteTransaction,
    clearTransactions,
    getLatestBalance,
    isOffline,
    isLoading
  }), [transactions, addTransaction, deleteTransaction, clearTransactions, getLatestBalance, isOffline, isLoading]);

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
