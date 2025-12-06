"use client"

import { SiteHeader } from '@/components/app/site-header';
import { DashboardSummary } from '@/components/app/dashboard-summary';
import { TransactionHistory } from '@/components/app/transaction-history';
import { AddTransaction } from '@/components/app/add-transaction';

export default function Home() {
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
