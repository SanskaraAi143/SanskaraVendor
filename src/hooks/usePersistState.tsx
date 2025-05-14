
import { useState, useEffect } from 'react';

/**
 * A hook that persists state in session storage to prevent state loss during navigation
 * This helps prevent page reloads when navigating between routes
 * 
 * @param key A unique key to identify this state in session storage
 * @param initialState The initial value of the state
 * @returns A stateful value and a function to update it, like useState
 */
export function usePersistState<T>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Generate a namespaced key for the session storage
  const storageKey = `sanskara-app-persist-${key}`;
  
  // Initialize state by first checking session storage, then using initialState if not found
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = sessionStorage.getItem(storageKey);
      return storedValue ? JSON.parse(storedValue) : initialState;
    } catch (error) {
      console.warn(`Error reading persisted state for key "${key}":`, error);
      return initialState;
    }
  });
  
  // Update session storage when state changes
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error persisting state for key "${key}":`, error);
    }
  }, [state, storageKey]);
  
  return [state, setState];
}

export default usePersistState;
