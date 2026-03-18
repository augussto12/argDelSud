import { useState, useEffect, useCallback } from 'react';
import api from '../../../shared/api/client';
import { useToastStore } from '../../../shared/hooks/useToastStore';

export interface Beca {
  id: number;
  porcentaje_descuento: string;
  motivo: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  activa: boolean;
  inscripcion: {
    alumno: { id: number; nombre: string; apellido: string; dni: string };
    taller: { id: number; nombre: string };
  };
}

export interface Inscripcion {
  id: number;
  alumno: { id: number; nombre: string; apellido: string; dni: string };
  taller: { id: number; nombre: string };
}

const EMPTY_FORM = { inscripcion_id: '', porcentaje_descuento: '', motivo: '', fecha_inicio: '', fecha_fin: '', aplicar_cuota_actual: true };

export function useBecas() {
  const [becas, setBecas] = useState<Beca[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [filtroActiva, setFiltroActiva] = useState('true');
  const [searchInsc, setSearchInsc] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBeca, setEditingBeca] = useState<Beca | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fetchBecas = useCallback(async () => {
    try {
      const params: any = {};
      if (filtroActiva !== '') params.activa = filtroActiva;
      const { data } = await api.get('/becas', { params });
      setBecas(data.data || []);
    } catch { setBecas([]); }
    finally { setLoadingPage(false); }
  }, [filtroActiva]);

  const fetchInscripciones = useCallback(async () => {
    try {
      const params: any = {};
      if (searchInsc) params.search = searchInsc;
      const { data } = await api.get('/becas/inscripciones', { params });
      setInscripciones(data.data || []);
    } catch { setInscripciones([]); }
  }, [searchInsc]);

  useEffect(() => { setPage(1); fetchBecas(); }, [fetchBecas]);
  useEffect(() => { if (showModal) fetchInscripciones(); }, [showModal, fetchInscripciones]);

  const paginatedBecas = becas.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditingBeca(null);
    setForm({ ...EMPTY_FORM });
    setSearchInsc('');
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (beca: Beca) => {
    setEditingBeca(beca);
    setForm({
      inscripcion_id: '',
      porcentaje_descuento: beca.porcentaje_descuento,
      motivo: beca.motivo || '',
      fecha_inicio: beca.fecha_inicio.split('T')[0],
      fecha_fin: beca.fecha_fin.split('T')[0],
      aplicar_cuota_actual: true,
    });
    setFieldErrors({});
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!editingBeca && !form.inscripcion_id) errs.inscripcion_id = 'Seleccioná un alumno inscripto';
    const pct = parseFloat(form.porcentaje_descuento);
    if (!form.porcentaje_descuento || isNaN(pct)) errs.porcentaje_descuento = 'Ingresá un porcentaje';
    else if (pct < 1 || pct > 100) errs.porcentaje_descuento = 'Debe ser entre 1 y 100';
    if (!form.fecha_inicio) errs.fecha_inicio = 'La fecha de inicio es obligatoria';
    if (!form.fecha_fin) errs.fecha_fin = 'La fecha de fin es obligatoria';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      if (editingBeca) {
        const { data } = await api.patch(`/becas/${editingBeca.id}`, {
          porcentaje_descuento: pct,
          motivo: form.motivo || null,
          fecha_inicio: form.fecha_inicio,
          fecha_fin: form.fecha_fin,
          aplicar_cuota_actual: form.aplicar_cuota_actual,
        });
        setMensaje(data.cuotaActualizada ? 'Beca actualizada y descuento aplicado a la cuota del mes' : 'Beca actualizada');
        useToastStore.getState().success(data.cuotaActualizada ? 'Beca actualizada y descuento aplicado' : 'Beca actualizada');
      } else {
        const { data } = await api.post('/becas', {
          inscripcion_id: parseInt(form.inscripcion_id),
          porcentaje_descuento: pct,
          motivo: form.motivo || null,
          fecha_inicio: form.fecha_inicio,
          fecha_fin: form.fecha_fin,
          aplicar_cuota_actual: form.aplicar_cuota_actual,
        });
        setMensaje(data.cuotaActualizada ? 'Beca creada y descuento aplicado a la cuota del mes' : 'Beca creada correctamente');
        useToastStore.getState().success(data.cuotaActualizada ? 'Beca creada y descuento aplicado' : 'Beca creada exitosamente');
      }
      setShowModal(false);
      fetchBecas();
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        const srvErrs: Record<string, string> = {};
        data.errors.forEach((e: any) => { srvErrs[e.campo] = e.mensaje; });
        setFieldErrors(srvErrs);
      } else {
        useToastStore.getState().error(data?.message || 'Error al guardar beca');
      }
    } finally { setLoading(false); }
  };

  const handleDesactivar = async (id: number) => {
    if (!confirm('¿Seguro que querés desactivar esta beca?')) return;
    try {
      await api.patch(`/becas/${id}/desactivar`);
      useToastStore.getState().success('Beca desactivada');
      fetchBecas();
    } catch (err: any) {
      useToastStore.getState().error(err.response?.data?.message || 'Error al desactivar beca');
    }
  };

  return {
    becas, paginatedBecas, inscripciones,
    filtroActiva, setFiltroActiva,
    searchInsc, setSearchInsc,
    showModal, setShowModal,
    editingBeca, form, setForm,
    loading, loadingPage, mensaje, setMensaje,
    fieldErrors, setFieldErrors,
    page, setPage, pageSize, setPageSize,
    openCreate, openEdit, handleSubmit, handleDesactivar,
  };
}
