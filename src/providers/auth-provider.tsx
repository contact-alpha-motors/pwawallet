"use client";

import { useFirebase, useUser } from "@/firebase";
import { ReactNode, useEffect, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Auth } from "firebase/auth";

interface AuthProviderProps {
    children: ReactNode;
}

const handleUserSession = (auth: Auth, isUserLoading: boolean, user: any) => {
    if (!isUserLoading && !user) {
        initiateAnonymousSignIn(auth).catch((error) => {
            console.error("Anonymous sign-in failed", error);
        });
    }
};

export function AuthProvider({ children }: AuthProviderProps) {
    const { firestore, auth } = useFirebase();
    const { user, isUserLoading } = useUser();
    const [isOnline, setIsOnline] = useState<boolean | undefined>(
        typeof window !== 'undefined' ? navigator.onLine : undefined
    );

    useEffect(() => {
        handleUserSession(auth, isUserLoading, user);
    }, [auth, isUserLoading, user]);
    

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleOnline = () => setIsOnline(true);
            const handleOffline = () => setIsOnline(false);

            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
    }, []);

    useEffect(() => {
        if (!user || !firestore || typeof isOnline === 'undefined') return;

        const userStatusRef = doc(firestore, 'presence', user.uid);

        const updateStatus = (online: boolean) => {
            const status = online ? {
                isOnline: true,
                lastActive: serverTimestamp(),
            } : {
                isOnline: false,
                lastActive: serverTimestamp(),
            };
            setDoc(userStatusRef, status, { merge: true });
        };

        updateStatus(isOnline);
        
        const handleBeforeUnload = () => {
             setDoc(userStatusRef, { isOnline: false, lastActive: serverTimestamp() }, { merge: true });
        }
        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
             setDoc(userStatusRef, { isOnline: false, lastActive: serverTimestamp() }, { merge: true });
             window.removeEventListener('beforeunload', handleBeforeUnload)
        };
    }, [user, firestore, isOnline]);


    return <>{children}</>;
}
