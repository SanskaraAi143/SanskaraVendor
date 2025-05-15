
import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

// Define cache entity types
type CacheEntityType = 'bookings' | 'tasks' | 'staff' | 'vendorProfile' | 'services' | 'reviews' | 'availability';

// Define a data cache item
interface CacheItem<T> {
  data: T | null;
  timestamp: number;
  loading: boolean;
  error: Error | null;
}

// Define expected state shape
interface DataCacheState {
  [key: string]: CacheItem<any>;
}

// Define action types
type DataCacheAction =
  | { type: 'SET_LOADING'; entityType: CacheEntityType; id?: string }
  | { type: 'SET_DATA'; entityType: CacheEntityType; data: any; id?: string }
  | { type: 'SET_ERROR'; entityType: CacheEntityType; error: Error; id?: string }
  | { type: 'INVALIDATE_CACHE'; entityType: CacheEntityType; id?: string }
  | { type: 'CLEAR_ALL' };

// Create initial state
const initialState: DataCacheState = {};

// Cache expiration time (in milliseconds) - 5 minutes
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Create context
const DataCacheContext = createContext<{
  state: DataCacheState;
  getCachedData: <T>(entityType: CacheEntityType, id?: string) => CacheItem<T> | null;
  setLoading: (entityType: CacheEntityType, id?: string) => void;
  setData: <T>(entityType: CacheEntityType, data: T, id?: string) => void;
  setError: (entityType: CacheEntityType, error: Error, id?: string) => void;
  invalidateCache: (entityType: CacheEntityType, id?: string) => void;
  clearAll: () => void;
}>({
  state: initialState,
  getCachedData: () => null,
  setLoading: () => {},
  setData: () => {},
  setError: () => {},
  invalidateCache: () => {},
  clearAll: () => {},
});

// Create reducer
const dataCacheReducer = (state: DataCacheState, action: DataCacheAction): DataCacheState => {
  switch (action.type) {
    case 'SET_LOADING': {
      const cacheKey = action.id ? `${action.entityType}-${action.id}` : action.entityType;
      return {
        ...state,
        [cacheKey]: {
          data: state[cacheKey]?.data || null,
          timestamp: state[cacheKey]?.timestamp || Date.now(),
          loading: true,
          error: null,
        },
      };
    }
    case 'SET_DATA': {
      const cacheKey = action.id ? `${action.entityType}-${action.id}` : action.entityType;
      return {
        ...state,
        [cacheKey]: {
          data: action.data,
          timestamp: Date.now(),
          loading: false,
          error: null,
        },
      };
    }
    case 'SET_ERROR': {
      const cacheKey = action.id ? `${action.entityType}-${action.id}` : action.entityType;
      return {
        ...state,
        [cacheKey]: {
          data: state[cacheKey]?.data || null,
          timestamp: Date.now(),
          loading: false,
          error: action.error,
        },
      };
    }
    case 'INVALIDATE_CACHE': {
      const cacheKey = action.id ? `${action.entityType}-${action.id}` : action.entityType;
      return {
        ...state,
        [cacheKey]: {
          data: null,
          timestamp: 0, // This will cause a refetch
          loading: false,
          error: null,
        },
      };
    }
    case 'CLEAR_ALL':
      return {};
    default:
      return state;
  }
};

// Create provider
export const DataCacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataCacheReducer, initialState);

  const getCachedData = useCallback(<T,>(entityType: CacheEntityType, id?: string): CacheItem<T> | null => {
    const cacheKey = id ? `${entityType}-${id}` : entityType;
    const cachedItem = state[cacheKey] as CacheItem<T>;
    
    if (!cachedItem) return null;
    
    // Check if cache is expired
    const now = Date.now();
    if (now - cachedItem.timestamp > CACHE_EXPIRATION) {
      return null;
    }
    
    return cachedItem;
  }, [state]);

  const setLoading = useCallback((entityType: CacheEntityType, id?: string) => {
    dispatch({ type: 'SET_LOADING', entityType, id });
  }, []);

  const setData = useCallback(<T,>(entityType: CacheEntityType, data: T, id?: string) => {
    dispatch({ type: 'SET_DATA', entityType, data, id });
  }, []);

  const setError = useCallback((entityType: CacheEntityType, error: Error, id?: string) => {
    dispatch({ type: 'SET_ERROR', entityType, error, id });
  }, []);

  const invalidateCache = useCallback((entityType: CacheEntityType, id?: string) => {
    dispatch({ type: 'INVALIDATE_CACHE', entityType, id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  return (
    <DataCacheContext.Provider
      value={{
        state,
        getCachedData,
        setLoading,
        setData,
        setError,
        invalidateCache,
        clearAll,
      }}
    >
      {children}
    </DataCacheContext.Provider>
  );
};

// Create hook for using the cache
export const useDataCache = () => {
  const context = useContext(DataCacheContext);
  if (context === undefined) {
    throw new Error('useDataCache must be used within a DataCacheProvider');
  }
  return context;
};
