"use client";

import { useAuth, useFirebase, useUser } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { ReactNode, useEffect, useState } from "react";
import { doc, setDoc, serverTimestamp, onSnapshot, getDoc } from "firebase/firestore";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { auth, firestore } = useFirebase();
    const { user, isUserLoading } = useUser();
    const [isOnline, setIsOnline] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsOnline(navigator.onLine);

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
        if (!isUserLoading && !user) {
            initiateAnonymousSignIn(auth);
        }
    }, [isUserLoading, user, auth]);

    useEffect(() => {
        if (!user || !firestore || typeof isOnline === 'undefined') return;

        const userStatusRef = doc(firestore, 'presence', user.uid);

        const updateStatus = (online: boolean) => {
            if (online) {
                setDoc(userStatusRef, {
                    isOnline: true,
                    lastActive: serverTimestamp(),
                }, { merge: true });
            } else {
                // Firestore's onDisconnect is not available in the client SDK.
                // We just update the status when the app is closed or offline.
                setDoc(userStatusRef, {
                    isOnline: false,
                    lastActive: serverTimestamp(),
                }, { merge: true });
            }
        };

        updateStatus(isOnline);

        // When the user closes the tab, we'll mark them as offline
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
