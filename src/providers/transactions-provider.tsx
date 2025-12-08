"use client";

import { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import type { Transaction, TransactionFirestore } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirebase, useUser, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, writeBatch, setDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useIsMobile } from '@/hooks/use-mobile';


interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'balance'> & { date: Date }) => void;
  deleteTransaction: (id: string) => void;
  clearTransactions: () => void;
  getLatestBalance: () => number;
  isOffline: boolean;
  isLoading: boolean;
  budget: number;
  budgetLoading: boolean;
  setBudget: (budget: number) => void;
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

  const budgetDocRef = useMemoFirebase(
    () => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    },
    [user, firestore]
  );
  const { data: userData, isLoading: budgetLoading } = useDoc<{budget: number}>(budgetDocRef);
  const budget = useMemo(() => userData?.budget || 0, [userData]);

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

    const sorted = [...firestoreTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let runningBalance = 0;
    const withBalance = sorted.map(t => {
      if (t.type === 'income') {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }
      return { ...t, balance: runningBalance };
    });

    return withBalance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [firestoreTransactions]);


  const getLatestBalance = useCallback(() => {
    if (transactions.length === 0) {
      return 0;
    }
    // The array is sorted descending by date, so the latest transaction is at index 0.
    const latestTransaction = transactions.reduce((latest, current) => {
        return new Date(current.date) > new Date(latest.date) ? current : latest;
    });
    return latestTransaction.balance;
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

  const setBudget = useCallback((newBudget: number) => {
    if (!budgetDocRef) {
        toast({
            variant: 'destructive',
            title: "Erreur",
            description: "Impossible de définir le budget. Utilisateur non connecté."
        });
        return;
    }
    setDocumentNonBlocking(budgetDocRef, { budget: newBudget }, { merge: true });
    toast({
        title: "Budget mis à jour",
        description: `Votre nouveau budget mensuel est de ${newBudget}.`
    })
  }, [budgetDocRef, toast]);


  const value = useMemo(() => ({
    transactions,
    addTransaction,
    deleteTransaction,
    clearTransactions,
    getLatestBalance,
    isOffline,
    isLoading: isLoading || budgetLoading,
    budget,
    budgetLoading,
    setBudget
  }), [transactions, addTransaction, deleteTransaction, clearTransactions, getLatestBalance, isOffline, isLoading, budget, budgetLoading, setBudget]);

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
