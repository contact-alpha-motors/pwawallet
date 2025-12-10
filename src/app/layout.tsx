'use client';

import './globals.css';
import { TransactionsProvider } from '@/providers/transactions-provider';
import { Toaster } from '@/components/ui/toaster';
import { DayPickerConfig } from '@/components/app/day-picker-config';
import { CategoriesProvider } from '@/providers/categories-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { DomainsProvider } from '@/providers/domains-provider';
import { PresenceProvider } from '@/providers/presence-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/apple-icon-180.png" />
        <meta name="theme-color" content="#90e0b6" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AuthProvider>
            <PresenceProvider>
              <DayPickerConfig />
              <DomainsProvider>
                <CategoriesProvider>
                  <TransactionsProvider>{children}</TransactionsProvider>
                </CategoriesProvider>
              </DomainsProvider>
              <Toaster />
            </PresenceProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
