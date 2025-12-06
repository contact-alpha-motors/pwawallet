export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO string
  type: TransactionType;
};

export const defaultCategories = [
  'Nourriture',
  'Transport',
  'Salaire',
  'Logement',
  'Factures',
  'Divertissement',
  'Santé',
  'Shopping',
  'Autre',
] as const;

export type TransactionCategory = (typeof defaultCategories)[number];
