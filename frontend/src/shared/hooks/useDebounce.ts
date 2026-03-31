import { useState, useEffect } from 'react';

/**
 * Hook genérico de debounce.
 * Retrasa la actualización del valor hasta que pasen `delay` ms sin cambios.
 *
 * @example
 * const debouncedSearch = useDebounce(search, 300);
 * useEffect(() => { fetchData(debouncedSearch); }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
