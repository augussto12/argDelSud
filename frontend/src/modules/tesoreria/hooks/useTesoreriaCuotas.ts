import { useState, useEffect, useCallback } from 'react';
import api from '../../../shared/api/client';
import { useToastStore } from '../../../shared/hooks/useToastStore';
import { showConfirm } from '../../../shared/hooks/useConfirmStore';
import type { Cuota, TallerOption } from '../types';

export function useTesoreriaCuotas() {
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [talleres, setTalleres] = useState<TallerOption[]>([]);
  const [filtroTaller, setFiltroTaller] = useState('');
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingCuotas, setLoadingCuotas] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    api.get('/talleres?activo=true').then(r => setTalleres(r.data.data || [])).catch(() => { });
  }, []);

  const fetchCuotas = useCallback(async () => {
    setLoadingCuotas(true);
    try {
      const params: any = {};
      if (filtroTaller) params.taller_id = filtroTaller;
      if (filtroMes) params.mes = filtroMes;
      if (filtroAnio) params.anio = filtroAnio;
      if (filtroEstado) params.estado = filtroEstado;
      const { data } = await api.get('/cuotas', { params });
      setCuotas(data.data || []);
    } catch { setCuotas([]); }
    finally { setLoadingPage(false); setLoadingCuotas(false); }
  }, [filtroTaller, filtroMes, filtroAnio, filtroEstado]);

  const paginatedCuotas = cuotas.slice((page - 1) * pageSize, page * pageSize);

  const handleGenerarMasivo = async () => {
    setLoadingAction(true);
    try {
      const { data } = await api.post('/cuotas/generar-masivo', {
        mes: filtroMes,
        anio: filtroAnio,
      });
      useToastStore.getState().success(data.message || 'Cuotas generadas exitosamente');
      fetchCuotas();
    } catch (err: any) {
      useToastStore.getState().error(err.response?.data?.message || 'Error al generar cuotas');
    } finally { setLoadingAction(false); }
  };

  const handleRegistrarPago = async (
    cuotaId: number,
    pagoForm: { monto_abonado: string; metodo_pago: string; observaciones: string },
    onSuccess: () => void,
  ) => {
    const monto = parseFloat(pagoForm.monto_abonado);
    if (!pagoForm.monto_abonado || isNaN(monto) || monto <= 0) {
      useToastStore.getState().error('Ingresá un monto válido mayor a 0');
      return;
    }
    setLoadingAction(true);
    try {
      await api.post('/cuotas/pagos', {
        cuota_id: cuotaId,
        monto_abonado: monto,
        metodo_pago: pagoForm.metodo_pago,
        observaciones: pagoForm.observaciones || null,
      });
      useToastStore.getState().success('Pago registrado correctamente');
      onSuccess();
      fetchCuotas();
    } catch (err: any) {
      useToastStore.getState().error(err.response?.data?.message || 'Error al registrar pago');
    } finally { setLoadingAction(false); }
  };

  const handleAnularCuota = async (id: number) => {
    const confirmed = await showConfirm({ title: 'Anular cuota', message: '¿Seguro que querés anular esta cuota? Esta acción no se puede deshacer.', confirmText: 'Anular', variant: 'danger' });
    if (!confirmed) return;
    try {
      await api.patch(`/cuotas/${id}/anular`);
      useToastStore.getState().success('Cuota anulada');
      fetchCuotas();
    } catch (err: any) {
      useToastStore.getState().error(err.response?.data?.message || 'Error al anular cuota');
    }
  };

  return {
    cuotas, paginatedCuotas, talleres,
    filtroTaller, setFiltroTaller,
    filtroMes, setFiltroMes,
    filtroAnio, setFiltroAnio,
    filtroEstado, setFiltroEstado,
    loadingPage, loadingCuotas, loadingAction,
    page, setPage, pageSize, setPageSize,
    fetchCuotas,
    handleGenerarMasivo, handleRegistrarPago, handleAnularCuota,
  };
}
