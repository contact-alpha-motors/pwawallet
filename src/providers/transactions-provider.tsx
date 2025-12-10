"use client";

import { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import type { Transaction, TransactionFirestore, Budget } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, setDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useIsMobile } from '@/hooks/use-mobile';


interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'balance' | 'index' | 'budgetId'> & { date: Date, budgetId?: string }) => void;
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id' | 'date' | 'balance' | 'index'> & { date: Date }) => void;
  deleteTransaction: (id: string) => void;
  clearTransactions: () => void;
  getLatestBalance: () => number;
  isOffline: boolean;
  isLoading: boolean;
  budgets: Budget[];
  budgetsLoading: boolean;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;
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
  const { data: firestoreTransactions, isLoading: transactionsLoading } = useCollection<TransactionFirestore>(transactionsQuery);

  const budgetsQuery = useMemoFirebase(
    () => {
        if (!user || !firestore) return null;
        return collection(firestore, 'users', user.uid, 'budgets');
    },
    [user, firestore]
  );
  const { data: budgets, isLoading: budgetsLoading } = useCollection<Budget>(budgetsQuery);


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

    const sorted = [...firestoreTransactions].sort((a, b) => a.index - b.index);
    
    let runningBalance = 0;
    const withBalance = sorted.map(t => {
      if (t.type === 'income') {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }
      return { ...t, balance: runningBalance };
    });

    return withBalance.sort((a, b) => b.index - a.index);
  }, [firestoreTransactions]);


  const getLatestBalance = useCallback(() => {
    if (transactions.length === 0) {
      return 0;
    }
    const latestTransaction = transactions.reduce((latest, current) => {
        return current.index > latest.index ? current : latest;
    });
    return latestTransaction.balance;
  }, [transactions]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'date' | 'balance' | 'index'> & { date: Date }) => {
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
        index: Date.now(),
    };
    
    addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'transactions'), transactionData);

    toast({
        title: "Transaction ajoutée",
        description: `${transaction.beneficiary} - ${transaction.amount}`,
    });

  }, [firestore, user, toast]);

  const updateTransaction = useCallback(async (id: string, transaction: Omit<Transaction, 'id' | 'date' | 'balance' | 'index'> & { date: Date }) => {
     if (!firestore || !user) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de modifier la transaction. Utilisateur non connecté.",
        });
        return;
    }
    const currentTransaction = firestoreTransactions?.find(t => t.id === id);
    if (!currentTransaction) return;

    const transactionData = {
        ...transaction,
        date: transaction.date.toISOString(),
        index: currentTransaction.index, // Keep original index to maintain order
    };

    const docRef = doc(firestore, 'users', user.uid, 'transactions', id);
    updateDocumentNonBlocking(docRef, transactionData);
    toast({ title: "Transaction modifiée" });
  }, [firestore, user, toast, firestoreTransactions]);

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

  const addBudget = useCallback((budget: Omit<Budget, 'id'>) => {
    if (!firestore || !user) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible d'ajouter le budget. Utilisateur non connecté."
        });
        return;
    }
    const newBudgetId = doc(collection(firestore, 'pids')).id;
    const budgetData = { ...budget, id: newBudgetId };
    const docRef = doc(firestore, 'users', user.uid, 'budgets', newBudgetId);
    setDocumentNonBlocking(docRef, budgetData, {});
    toast({
        title: "Budget ajouté",
        description: `Le budget "${budget.name}" a été créé.`
    });
  }, [firestore, user, toast]);

  const updateBudget = useCallback((id: string, budget: Omit<Budget, 'id'>) => {
     if (!firestore || !user) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de modifier le budget. Utilisateur non connecté."
        });
        return;
    }
    const docRef = doc(firestore, 'users', user.uid, 'budgets', id);
    updateDocumentNonBlocking(docRef, budget);
    toast({ title: "Budget modifié" });
  }, [firestore, user, toast]);

  const deleteBudget = useCallback((id: string) => {
    if (!firestore || !user) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de supprimer le budget. Utilisateur non connecté."
        });
        return;
    }
    const docRef = doc(firestore, 'users', user.uid, 'budgets', id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Budget supprimé" });
  }, [firestore, user, toast]);


  const value = useMemo(() => ({
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearTransactions,
    getLatestBalance,
    isOffline,
    isLoading: transactionsLoading || budgetsLoading,
    budgets: budgets || [],
    budgetsLoading,
    addBudget,
    updateBudget,
    deleteBudget,
  }), [transactions, addTransaction, updateTransaction, deleteTransaction, clearTransactions, getLatestBalance, isOffline, transactionsLoading, budgets, budgetsLoading, addBudget, updateBudget, deleteBudget]);

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
