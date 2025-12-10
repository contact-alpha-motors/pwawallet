export type TransactionType = 'income' | 'expense';

export type Domain =
  | 'Bureau'
  | 'Showroom'
  | 'Prestataire Externe'
  | 'Besoins'
  | 'Autre';

export const defaultDomains: readonly string[] = [
  'Bureau',
  'Showroom',
  'Prestataire Externe',
  'Besoins',
  'Autre',
];

export interface Budget {
  id: string;
  name: string;
  amount: number;
}

// This represents the data structure in Firestore
export interface TransactionFirestore {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO string
  type: TransactionType;
  beneficiary: string;
  domain: string;
  budgetId?: string;
  index: number; // Timestamp for ordering
}

// This represents the data structure in the client, with the calculated balance
export type Transaction = TransactionFirestore & {
  balance: number;
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
