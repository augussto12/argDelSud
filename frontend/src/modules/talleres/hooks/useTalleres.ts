import { useState, useEffect, useCallback } from 'react';
import api from '../../../shared/api/client';
import { useToastStore } from '../../../shared/hooks/useToastStore';
import { showConfirm } from '../../../shared/hooks/useConfirmStore';
import type { Taller, Dia, ApiResponse } from '../../../shared/types';
import type { Profesor, DiaForm, InscriptoInfo } from '../types';
import { EMPTY_FORM } from '../types';

export function useTalleres() {
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [dias, setDias] = useState<Dia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingLoad, setSavingLoad] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Taller | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [diasForm, setDiasForm] = useState<DiaForm[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Detalle
  const [showDetalle, setShowDetalle] = useState(false);
  const [detalleTaller, setDetalleTaller] = useState<any>(null);

  // Inscribir
  const [showInscribir, setShowInscribir] = useState(false);
  const [inscribirTallerId, setInscribirTallerId] = useState<number | null>(null);
  const [alumnos, setAlumnos] = useState<InscriptoInfo[]>([]);
  const [alumnoSearch, setAlumnoSearch] = useState('');

  const fetchTalleres = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { activo: 'true' };
      if (search) params.search = search;
      const res = await api.get<ApiResponse<Taller[]>>('/talleres', { params });
      setTalleres(res.data.data);
    } catch { /* API not running */ }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { setPage(1); fetchTalleres(); }, [fetchTalleres]);

  const paginatedTalleres = talleres.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    api.get('/profesores?activo=true').then(r => setProfesores(r.data.data || [])).catch(() => {});
    api.get('/talleres/dias').then(r => setDias(r.data.data || [])).catch(() => {});
  }, []);

  // ─── Create / Edit ─────────────────────────────
  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, profesor_id: profesores[0]?.id?.toString() || '' });
    setDiasForm([{ dia_id: 1, hora_inicio: '09:00', hora_fin: '10:00' }]);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (t: Taller) => {
    setEditing(t);
    setForm({
      nombre: t.nombre,
      categoria: t.categoria,
      precio_mensual: String(t.precio_mensual),
      cupo_maximo: String(t.cupo_maximo),
      profesor_id: String(t.profesor_id),
      fecha_inicio: t.fecha_inicio?.split('T')[0] || '',
      fecha_fin: t.fecha_fin?.split('T')[0] || '',
    });
    setDiasForm(
      (t.tallerDias || []).map(td => ({
        dia_id: td.dia_id,
        hora_inicio: td.hora_inicio?.substring(11, 16) || '09:00',
        hora_fin: td.hora_fin?.substring(11, 16) || '10:00',
      }))
    );
    setFieldErrors({});
    setShowModal(true);
  };

  const addDia = () => setDiasForm([...diasForm, { dia_id: 1, hora_inicio: '09:00', hora_fin: '10:00' }]);
  const removeDia = (i: number) => setDiasForm(diasForm.filter((_, idx) => idx !== i));
  const updateDia = (i: number, field: keyof DiaForm, value: any) => {
    const updated = [...diasForm];
    (updated[i] as any)[field] = field === 'dia_id' ? parseInt(value) : value;
    setDiasForm(updated);
  };

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    else if (form.nombre.trim().length < 2) errs.nombre = 'Mínimo 2 caracteres';
    if (!form.precio_mensual || parseFloat(form.precio_mensual) <= 0) errs.precio_mensual = 'Ingresá un precio válido mayor a 0';
    if (!form.cupo_maximo || parseInt(form.cupo_maximo) <= 0) errs.cupo_maximo = 'Ingresá un cupo válido';
    if (!form.profesor_id) errs.profesor_id = 'Seleccioná un profesor';
    if (!form.fecha_inicio) errs.fecha_inicio = 'La fecha de inicio es obligatoria';
    if (!form.fecha_fin) errs.fecha_fin = 'La fecha de fin es obligatoria';
    if (diasForm.length === 0) errs.dias = 'Agregá al menos un día';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingLoad(true);
    try {
      const payload = {
        nombre: form.nombre,
        categoria: form.categoria,
        precio_mensual: parseFloat(form.precio_mensual),
        cupo_maximo: parseInt(form.cupo_maximo),
        profesor_id: parseInt(form.profesor_id),
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        dias: diasForm,
      };
      if (editing) {
        await api.put(`/talleres/${editing.id}`, payload);
        useToastStore.getState().success('Taller actualizado exitosamente');
      } else {
        await api.post('/talleres', payload);
        useToastStore.getState().success('Taller creado exitosamente');
      }
      setShowModal(false);
      fetchTalleres();
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        const srvErrs: Record<string, string> = {};
        data.errors.forEach((e: any) => { srvErrs[e.campo] = e.mensaje; });
        setFieldErrors(srvErrs);
      } else {
        useToastStore.getState().error(data?.message || 'Error al guardar taller');
      }
    } finally { setSavingLoad(false); }
  };

  const handleDesactivar = async (id: number) => {
    const confirmed = await showConfirm({ title: 'Desactivar taller', message: '¿Seguro que querés desactivar este taller?', confirmText: 'Desactivar', variant: 'danger' });
    if (!confirmed) return;
    try {
      await api.delete(`/talleres/${id}`);
      useToastStore.getState().success('Taller desactivado');
      fetchTalleres();
    } catch (err: any) {
      useToastStore.getState().error(err.response?.data?.message || 'Error al desactivar');
    }
  };

  // ─── Detalle ───────────────────────────────────
  const openDetalle = async (id: number) => {
    try {
      const { data } = await api.get(`/talleres/${id}`);
      setDetalleTaller(data.data);
      setShowDetalle(true);
    } catch { useToastStore.getState().error('Error cargando detalle'); }
  };

  // ─── Inscribir ─────────────────────────────────
  const openInscribir = (tallerId: number) => {
    setInscribirTallerId(tallerId);
    setAlumnoSearch('');
    setAlumnos([]);
    setShowInscribir(true);
    fetchAlumnos('');
  };

  const fetchAlumnos = async (q: string) => {
    try {
      const params: any = { activo: 'true' };
      if (q) params.search = q;
      const { data } = await api.get('/alumnos', { params });
      setAlumnos((data.data || []).map((a: any) => ({ id: a.id, nombre: a.nombre, apellido: a.apellido, dni: a.dni })));
    } catch { setAlumnos([]); }
  };

  const handleInscribir = async (alumnoId: number) => {
    if (!inscribirTallerId) return;
    try {
      await api.post(`/talleres/${inscribirTallerId}/inscribir`, { alumno_id: alumnoId });
      useToastStore.getState().success('Alumno inscripto exitosamente');
      setShowInscribir(false);
      fetchTalleres();
    } catch (err: any) {
      useToastStore.getState().error(err.response?.data?.message || 'Error al inscribir');
    }
  };

  const handleDesinscribir = async (tallerId: number, alumnoId: number) => {
    const confirmed = await showConfirm({ title: 'Desinscribir alumno', message: '¿Seguro que querés desinscribir al alumno de este taller?', confirmText: 'Desinscribir', variant: 'warning' });
    if (!confirmed) return;
    try {
      await api.delete(`/talleres/${tallerId}/desinscribir/${alumnoId}`);
      useToastStore.getState().success('Alumno desinscripto');
      openDetalle(tallerId);
      fetchTalleres();
    } catch (err: any) {
      useToastStore.getState().error(err.response?.data?.message || 'Error al desinscribir');
    }
  };

  return {
    talleres, paginatedTalleres, profesores, dias,
    loading, savingLoad, search, setSearch,
    page, setPage, pageSize, setPageSize,
    // Form
    showModal, setShowModal, editing, form, setForm, diasForm, fieldErrors, setFieldErrors,
    openCreate, openEdit, addDia, removeDia, updateDia, handleSubmit,
    handleDesactivar,
    // Detalle
    showDetalle, setShowDetalle, detalleTaller, openDetalle,
    // Inscribir
    showInscribir, setShowInscribir, alumnos, alumnoSearch, setAlumnoSearch,
    inscribirTallerId, openInscribir, fetchAlumnos,
    handleInscribir, handleDesinscribir,
  };
}
