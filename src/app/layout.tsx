import type { Metadata, Viewport } from 'next';
import './globals.css';
import { TransactionsProvider } from '@/providers/transactions-provider';
import { Toaster } from '@/components/ui/toaster';
import { DayPickerConfig } from '@/components/app/day-picker-config';
import { CategoriesProvider } from '@/providers/categories-provider';

export const metadata: Metadata = {
  title: 'MonPortefeuille PWA',
  description: 'Un simple PWA pour le suivi des finances personnelles.',
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
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link rel='apple-touch-icon' href='/apple-icon-180.png' />
      </head>
      <body className="font-body antialiased">
        <DayPickerConfig />
        <CategoriesProvider>
          <TransactionsProvider>
            {children}
          </TransactionsProvider>
        </CategoriesProvider>
        <Toaster />
      </body>
    </html>
  );
}
