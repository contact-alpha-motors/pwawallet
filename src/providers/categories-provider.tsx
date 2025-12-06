"use client";

import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { defaultCategories, TransactionCategory } from '@/lib/types';

interface CategoriesContextType {
  categories: string[];
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [customCategories, setCustomCategories] = useLocalStorage<string[]>('custom-categories', []);

  const addCategory = useCallback((category: string) => {
    if (category && !defaultCategories.includes(category as TransactionCategory) && !customCategories.includes(category)) {
      setCustomCategories(prev => [...prev, category]);
    }
  }, [customCategories, setCustomCategories]);

  const deleteCategory = useCallback((category: string) => {
    setCustomCategories(prev => prev.filter(c => c !== category));
  }, [setCustomCategories]);

  const categories = useMemo(() => {
    const allCategories = [...defaultCategories, ...customCategories].sort((a, b) => a.localeCompare(b));
    return Array.from(new Set(allCategories));
  }, [customCategories]);

  const value = useMemo(() => ({
    categories,
    addCategory,
    deleteCategory,
  }), [categories, addCategory, deleteCategory]);

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}
