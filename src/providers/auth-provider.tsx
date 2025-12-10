'use client';

import { useFirebase, useUser } from '@/firebase';
import { ReactNode, useEffect, useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Auth } from 'firebase/auth';

interface AuthProviderProps {
  children: ReactNode;
}

const handleUserSession = (auth: Auth, isUserLoading: boolean, user: any) => {
  if (!isUserLoading && !user) {
    initiateAnonymousSignIn(auth).catch((error) => {
      console.error('Anonymous sign-in failed', error);
    });
  }
};

export function AuthProvider({ children }: AuthProviderProps) {
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    handleUserSession(auth, isUserLoading, user);
  }, [auth, isUserLoading, user]);

  return <>{children}</>;
}
