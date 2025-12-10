
'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useFirebase, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { openDB, IDBPDatabase } from 'idb';

interface PresenceContextType {
  isOnline: boolean;
}

const PresenceContext = createContext<PresenceContextType | undefined>(
  undefined
);

const DB_NAME = 'presence-db';
const STORE_NAME = 'presence-store';
const KEY = 'user-status';

async function getDb(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
}

export function PresenceProvider({ children }: { children: ReactNode }) {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  const updateOnlineStatus = useCallback(async () => {
    const online = navigator.onLine;
    setIsOnline(online);

    if (user && firestore) {
      const userStatusRef = doc(firestore, 'presence', user.uid);
      const db = await getDb();

      try {
        if (online) {
          // If we are online, try to set presence in Firestore
          await setDoc(
            userStatusRef,
            { isOnline: true, lastActive: serverTimestamp() },
            { merge: true }
          );
          await db.delete(STORE_NAME, KEY); // Clear offline flag
        } else {
          // If we are offline, just save this intent locally
          await db.put(
            STORE_NAME,
            { isOnline: false, lastActive: new Date().toISOString() },
            KEY
          );
        }
      } catch (error) {
        console.error('Failed to update presence status:', error);
        // If firestore fails (e.g., offline), save locally
        if (!online) {
             await db.put(
                STORE_NAME,
                { isOnline: false, lastActive: new Date().toISOString() },
                KEY
             );
        }
      }
    }
  }, [user, firestore]);

  // Listen to browser's online/offline events
  useEffect(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    // Set initial status
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [updateOnlineStatus]);

  // Effect to set presence when user is available
  useEffect(() => {
    if (user && firestore) {
      updateOnlineStatus();
    }
  }, [user, firestore, updateOnlineStatus]);

  // Effect to handle page close/unload
  useEffect(() => {
    const handleUnload = async () => {
      if (user && firestore) {
        const userStatusRef = doc(firestore, 'presence', user.uid);
        // Use a synchronous method if needed, but Firestore SDK handles offline queueing
        try {
            await setDoc(userStatusRef, { isOnline: false, lastActive: serverTimestamp() }, { merge: true });
        } catch (e) {
            // This might fail if the browser closes too quickly, but it's our best effort.
            console.warn("Could not set offline status on page unload.", e);
        }
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [user, firestore]);

  return (
    <PresenceContext.Provider value={{ isOnline }}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
}
