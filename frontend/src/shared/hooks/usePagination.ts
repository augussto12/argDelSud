import { useState, useMemo } from 'react';

/**
 * Hook reutilizable de paginación client-side.
 * Elimina la duplicación del patrón page/pageSize/slice en cada módulo.
 *
 * @example
 * const { paginatedItems, page, pageSize, setPage, setPageSize, totalItems } = usePagination(alumnos, 25);
 */
export function usePagination<T>(items: T[], defaultPageSize = 25) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalItems = items.length;

  const paginatedItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  // Reset page when items change (search/filter)
  const resetPage = () => setPage(1);

  return {
    paginatedItems,
    page,
    pageSize,
    setPage,
    setPageSize,
    totalItems,
    resetPage,
  };
}
