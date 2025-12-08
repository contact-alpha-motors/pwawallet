"use client";

import { useFirebase, useUser } from "@/firebase";
import { ReactNode, useEffect, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { firestore } = useFirebase();
    const { user } = useUser();
    const [isOnline, setIsOnline] = useState<boolean | undefined>(
        typeof window !== 'undefined' ? navigator.onLine : undefined
    );

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
        
        // This is not fully reliable as it's not guaranteed to run.
        // A better solution would use server-side functions (e.g. Cloud Functions)
        // with real-time database to manage presence, but for a client-only
        // solution, this is a reasonable approach.
        const handleBeforeUnload = () => {
             // Using navigator.sendBeacon would be more reliable here but requires more setup
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
