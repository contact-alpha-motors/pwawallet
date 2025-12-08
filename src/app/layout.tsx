"use client"; // This component needs to be a client component for useEffect

import type { Metadata, Viewport } from 'next';
import { useEffect } from 'react';
import './globals.css';
import { TransactionsProvider } from '@/providers/transactions-provider';
import { Toaster } from '@/components/ui/toaster';
import { DayPickerConfig } from '@/components/app/day-picker-config';
import { CategoriesProvider } from '@/providers/categories-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthProvider } from '@/providers/auth-provider';

// This is our new debug component
const ClickDebugger = () => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      console.log(
        `[Click Debugger] Clicked on: <${target.tagName.toLowerCase()}>`,
        {
          id: target.id || 'no id',
          className: target.className || 'no class',
          element: target,
        }
      );
    };

    console.log('[Click Debugger] Attached global click listener.');
    window.addEventListener('click', handleClick, true); // Use capture phase to get all clicks

    return () => {
      console.log('[Click Debugger] Removed global click listener.');
      window.removeEventListener('click', handleClick, true);
    };
  }, []);

  return null; // This component doesn't render anything visible
};


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
        <ClickDebugger />
        <FirebaseClientProvider>
          <AuthProvider>
            <DayPickerConfig />
            <CategoriesProvider>
              <TransactionsProvider>
                {children}
              </TransactionsProvider>
            </CategoriesProvider>
            <Toaster />
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

// NOTE: We are intentionally not re-adding Metadata and Viewport exports here
// because they can only be defined in Server Components, and we've converted
// this file to a Client Component for the debugger. This is a temporary change.
