"use client";

import { useState, useEffect, useCallback } from 'react';

// A custom hook that uses the browser's localStorage to persist state.
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  
  // This function reads the value from localStorage.
  // It's wrapped in useCallback to prevent it from being recreated on every render.
  const readValue = useCallback((): T => {
    // We can't access `window` on the server, so we return the initial value.
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      // If the item exists, parse it from JSON. Otherwise, return the initial value.
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      // If there's an error reading from localStorage, log a warning and return the initial value.
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // This state holds the current value. It's initialized by reading from localStorage.
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // This function updates the value in both state and localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    // We can't access `window` on the server, so we log a warning.
    if (typeof window === 'undefined') {
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`
      );
    }

    try {
      // The new value can be a value or a function that receives the old value.
      const newValue = value instanceof Function ? value(storedValue) : value;
      // Save the new value to localStorage.
      window.localStorage.setItem(key, JSON.stringify(newValue));
      // Update the state with the new value.
      setStoredValue(newValue);
      // Dispatch a custom event to notify other instances of the hook that the value has changed.
      window.dispatchEvent(new Event("local-storage"));
    } catch (error) {
      // If there's an error setting the value, log a warning.
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  // This effect listens for changes to the value in other browser tabs or windows.
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // Add event listeners for both 'storage' (for other tabs) and 'local-storage' (for the same tab).
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleStorageChange);

    // Clean up the event listeners when the component unmounts.
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleStorageChange);
    };
  }, [readValue]);

  // Return the current value and the function to update it.
  return [storedValue, setValue];
}
