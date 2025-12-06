"use client";

import { useState, useEffect, useCallback } from 'react';

// This function is a helper to check if we are on the client
const isClient = typeof window === 'object';

// A custom hook that uses the browser's localStorage to persist state.
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  
  // This function reads the value from localStorage.
  const readValue = useCallback((): T => {
    if (!isClient) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // We need to useEffect to read value from localStorage on client side
  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const setValue = (value: T | ((val: T) => T)) => {
    if (!isClient) {
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`
      );
      return;
    }

    try {
      const newValue = value instanceof Function ? value(storedValue) : value;
      window.localStorage.setItem(key, JSON.stringify(newValue));
      setStoredValue(newValue);
      window.dispatchEvent(new Event("local-storage"));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
        if ((e as StorageEvent).key && (e as StorageEvent).key !== key) {
            return;
        }
        setStoredValue(readValue());
    };
    
    // Listen for Service Worker sync completion
    const handleSyncMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'SYNC_COMPLETE') {
            console.log('Client: Received SYNC_COMPLETE message. Refreshing data.');
            setStoredValue(readValue());
        }
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleStorageChange);
    navigator.serviceWorker?.addEventListener('message', handleSyncMessage);


    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleStorageChange);
      navigator.serviceWorker?.removeEventListener('message', handleSyncMessage);
    };
  }, [key, readValue]);

  return [storedValue, setValue];
}
