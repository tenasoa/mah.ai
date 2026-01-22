import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to debounce a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook to create a debounced callback function
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update the callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

/**
 * Hook to track loading state with debounce (prevents flashing loaders)
 * @param isLoading - The actual loading state
 * @param delay - Minimum time to show loading state (prevents flash)
 * @returns The debounced loading state
 */
export function useDebouncedLoading(
  isLoading: boolean,
  delay: number = 200
): boolean {
  const [showLoading, setShowLoading] = useState(false);
  const loadingStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      loadingStartRef.current = Date.now();
      setShowLoading(true);
    } else if (loadingStartRef.current !== null) {
      const elapsed = Date.now() - loadingStartRef.current;
      const remaining = Math.max(0, delay - elapsed);

      const timeout = setTimeout(() => {
        setShowLoading(false);
        loadingStartRef.current = null;
      }, remaining);

      return () => clearTimeout(timeout);
    }
  }, [isLoading, delay]);

  return showLoading;
}

/**
 * Hook for instant search with debounced API calls
 * @param searchFn - The search function to call
 * @param delay - The debounce delay
 * @returns Object with query, setQuery, results, isLoading, and error
 */
export function useInstantSearch<T>(
  searchFn: (query: string) => Promise<T>,
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, delay);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't search for empty queries
    if (!debouncedQuery.trim()) {
      setResults(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await searchFn(debouncedQuery);
        setResults(data);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery, searchFn]);

  const clear = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clear,
    debouncedQuery,
  };
}

export default useDebounce;
