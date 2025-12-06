export type TransactionType = 'income' | 'expense';

export type Domain = 'Bureau' | 'Showroom' | 'Prestataire Externe' | 'Autre';

export const defaultDomains: readonly Domain[] = [
  'Bureau',
  'Showroom',
  'Prestataire Externe',
  'Autre',
];

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO string
  type: TransactionType;
  beneficiary: string;
  domain: string;
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
