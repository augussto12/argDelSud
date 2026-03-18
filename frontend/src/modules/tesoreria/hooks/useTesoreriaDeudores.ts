import { useState, useCallback } from 'react';
import api from '../../../shared/api/client';
import type { Deudor } from '../types';

export function useTesoreriaDeudores() {
  const [deudores, setDeudores] = useState<Deudor[]>([]);
  const [filtroTallerDeudores, setFiltroTallerDeudores] = useState('');
  const [loadingDeudores, setLoadingDeudores] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fetchDeudores = useCallback(async () => {
    setLoadingDeudores(true);
    try {
      const params: any = {};
      if (filtroTallerDeudores) params.taller_id = filtroTallerDeudores;
      const { data } = await api.get('/cuotas/deudores', { params });
      setDeudores(data.data || []);
    } catch { setDeudores([]); }
    finally { setLoadingDeudores(false); }
  }, [filtroTallerDeudores]);

  const paginatedDeudores = deudores.slice((page - 1) * pageSize, page * pageSize);

  return {
    deudores, paginatedDeudores,
    filtroTallerDeudores, setFiltroTallerDeudores,
    loadingDeudores,
    page, setPage, pageSize, setPageSize,
    fetchDeudores,
  };
}
