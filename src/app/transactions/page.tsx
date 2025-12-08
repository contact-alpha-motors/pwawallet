'use client';
import { useTransactions } from '@/providers/transactions-provider';
import { SiteHeader } from '@/components/app/site-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/types';
import { AddTransaction } from '@/components/app/add-transaction';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};

export default function AllTransactionsPage() {
  const { transactions, isLoading } = useTransactions();

  return (
    <div className="flex flex-col min-h-dvh bg-background font-body">
      <SiteHeader />
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <h1 className="text-2xl font-bold">Toutes les transactions</h1>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Bénéficiaire</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Domaine</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="text-right">Solde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {!isLoading && transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Aucune transaction trouvée.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                transactions.map((t: Transaction) => (
                  <TableRow key={t.id}>
                    <TableCell>{format(new Date(t.date), 'd MMM yyyy', { locale: fr })}</TableCell>
                    <TableCell>
                      <Badge variant={t.type === 'income' ? 'secondary' : 'destructive'}>
                        {t.type === 'income' ? 'Revenu' : 'Dépense'}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.beneficiary}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell>{t.category}</TableCell>
                    <TableCell>{t.domain}</TableCell>
                    <TableCell className={cn(
                        'text-right font-medium',
                        t.type === 'income' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(t.balance)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </main>
      <AddTransaction />
    </div>
  );
}
