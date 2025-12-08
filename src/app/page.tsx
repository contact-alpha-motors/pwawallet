"use client"

import { SiteHeader } from '@/components/app/site-header';
import { DashboardSummary } from '@/components/app/dashboard-summary';
import { TransactionHistory } from '@/components/app/transaction-history';
import { AddTransaction } from '@/components/app/add-transaction';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex flex-col min-h-dvh bg-background font-body">
        <SiteHeader />
        <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6 flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">MonPortefeuille</h2>
                <p className="text-muted-foreground">Chargement de vos données...</p>
                <Skeleton className="h-24 w-full mt-4" />
                <Skeleton className="h-64 w-full mt-6" />
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background font-body">
      <SiteHeader />
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <DashboardSummary />
        <TransactionHistory />
      </main>
      <AddTransaction />
    </div>
  );
}
