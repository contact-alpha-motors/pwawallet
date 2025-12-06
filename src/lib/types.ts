export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO string
  type: TransactionType;
};

export const TransactionCategories = [
  'Food',
  'Transport',
  'Salary',
  'Housing',
  'Utilities',
  'Entertainment',
  'Health',
  'Shopping',
  'Other',
] as const;

export type TransactionCategory = typeof TransactionCategories[number];
