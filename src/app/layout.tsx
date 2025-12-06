import type { Metadata, Viewport } from 'next';
import './globals.css';
import { TransactionsProvider } from '@/providers/transactions-provider';
import { Toaster } from '@/components/ui/toaster';
import { ServiceWorker } from '@/components/service-worker';

export const metadata: Metadata = {
  title: 'MyWallet PWA',
  description: 'A simple personal finance tracker PWA.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#A8D9A8',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <TransactionsProvider>
          {children}
        </TransactionsProvider>
        <Toaster />
        <ServiceWorker />
      </body>
    </html>
  );
}
