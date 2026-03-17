import { useState, useEffect, useCallback } from 'react';
import { GraduationCap, Plus, Pencil, XCircle, ChevronDown } from 'lucide-react';
import api from '../../shared/api/client';
import TableLoader from '../../shared/components/TableLoader';
import { useToastStore } from '../../shared/hooks/useToastStore';

interface Beca {
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

interface Inscripcion {
  id: number;
  alumno: { id: number; nombre: string; apellido: string; dni: string };
  taller: { id: number; nombre: string };
}

export default function BecasPage() {
  const [becas, setBecas] = useState<Beca[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [filtroActiva, setFiltroActiva] = useState('true');
  const [searchInsc, setSearchInsc] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBeca, setEditingBeca] = useState<Beca | null>(null);
  const [form, setForm] = useState({ inscripcion_id: '', porcentaje_descuento: '', motivo: '', fecha_inicio: '', fecha_fin: '', aplicar_cuota_actual: true });
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  useEffect(() => { fetchBecas(); }, [fetchBecas]);
  useEffect(() => { if (showModal) fetchInscripciones(); }, [showModal, fetchInscripciones]);

  const openCreate = () => {
    setEditingBeca(null);
    setForm({ inscripcion_id: '', porcentaje_descuento: '', motivo: '', fecha_inicio: '', fecha_fin: '', aplicar_cuota_actual: true });
    setSearchInsc('');
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
    setShowModal(true);
  };

  const handleSubmit = async () => {
    // Per-field validation
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

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Becas</h1>
          <p className="text-muted text-sm mt-1">Gestión de descuentos y becas por inscripción</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-400 hover:from-accent-600 hover:to-accent-500 text-white font-semibold rounded-xl shadow-lg shadow-accent-500/20 transition-all hover:-translate-y-0.5 cursor-pointer text-sm">
          <Plus className="w-4 h-4" />
          Nueva Beca
        </button>
      </div>

      {mensaje && (
        <div className="mb-4 p-3 rounded-xl bg-card border border-card text-sm font-medium text-body animate-slideUp cursor-pointer" onClick={() => setMensaje('')}>
          {mensaje}
        </div>
      )}

      {/* Filtro estado */}
      <div className="bg-card border border-card rounded-xl p-4 mb-6 flex gap-3 items-end">
        <div className="w-36">
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Estado</label>
          <div className="relative">
            <select value={filtroActiva} onChange={e => setFiltroActiva(e.target.value)}
              className="w-full py-2.5 pl-3 pr-8 rounded-lg border border-card bg-card text-body text-sm font-medium appearance-none cursor-pointer">
              <option value="">Todas</option>
              <option value="true">Activas</option>
              <option value="false">Inactivas</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {loadingPage ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="w-8 h-8 text-accent-500 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-muted font-medium text-sm">Cargando becas...</p>
          </div>
        ) : becas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <GraduationCap size={32} className="mb-2 text-secondary-200" />
            <p>No se encontraron becas</p>
          </div>
        ) : (
          becas.map(b => (
            <div key={b.id} className="bg-card border border-card rounded-xl p-4 space-y-2 animate-fadeIn">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-heading truncate">{b.inscripcion.alumno.apellido}, {b.inscripcion.alumno.nombre}</p>
                  <p className="text-xs text-muted">DNI: {b.inscripcion.alumno.dni}</p>
                  <p className="text-xs text-body mt-0.5">{b.inscripcion.taller.nombre}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(b)}
                    className="tap-target rounded-lg hover:bg-surface transition-colors cursor-pointer" title="Editar">
                    <Pencil className="w-4 h-4 text-muted" />
                  </button>
                  {b.activa && (
                    <button onClick={() => handleDesactivar(b.id)}
                      className="tap-target rounded-lg hover:bg-danger-50 transition-colors cursor-pointer" title="Desactivar">
                      <XCircle className="w-4 h-4 text-danger-500" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-accent-100 text-accent-700">
                  {parseFloat(b.porcentaje_descuento)}%
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  b.activa ? 'bg-success-100 text-success-700' : 'bg-secondary-200 text-secondary-600'
                }`}>
                  {b.activa ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted">
                <span>{new Date(b.fecha_inicio).toLocaleDateString()} — {new Date(b.fecha_fin).toLocaleDateString()}</span>
              </div>
              {b.motivo && <p className="text-xs text-body italic">{b.motivo}</p>}
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card border border-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card bg-surface-alt">
                <th className="text-left px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Alumno</th>
                <th className="text-left px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Taller</th>
                <th className="text-center px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">% Descuento</th>
                <th className="text-left px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Motivo</th>
                <th className="text-center px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Desde</th>
                <th className="text-center px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Hasta</th>
                <th className="text-center px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Estado</th>
                <th className="text-right px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loadingPage ? (
                <TableLoader colSpan={8} text="Cargando becas..." />
              ) : becas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <GraduationCap className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-muted font-medium">No se encontraron becas</p>
                  </td>
                </tr>
              ) : (
                becas.map(b => (
                  <tr key={b.id} className="border-b border-card hover-row transition-colors">
                    <td className="px-4 py-3 font-medium text-heading">
                      {b.inscripcion.alumno.apellido}, {b.inscripcion.alumno.nombre}
                      <span className="block text-xs text-muted">DNI: {b.inscripcion.alumno.dni}</span>
                    </td>
                    <td className="px-4 py-3 text-body">{b.inscripcion.taller.nombre}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-accent-100 text-accent-700">
                        {parseFloat(b.porcentaje_descuento)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body text-sm">{b.motivo || '—'}</td>
                    <td className="px-4 py-3 text-center text-sm text-body">{new Date(b.fecha_inicio).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center text-sm text-body">{new Date(b.fecha_fin).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        b.activa ? 'bg-success-100 text-success-700' : 'bg-secondary-200 text-secondary-600'
                      }`}>
                        {b.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(b)}
                          className="tap-target rounded-lg hover:bg-surface transition-colors cursor-pointer" title="Editar">
                          <Pencil className="w-4 h-4 text-muted" />
                        </button>
                        {b.activa && (
                          <button onClick={() => handleDesactivar(b.id)}
                            className="tap-target rounded-lg hover:bg-danger-50 transition-colors cursor-pointer" title="Desactivar">
                            <XCircle className="w-4 h-4 text-danger-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ Modal: Crear/Editar Beca ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-slideUp border border-card">
            <h3 className="text-xl font-bold text-heading mb-6">{editingBeca ? 'Editar Beca' : 'Nueva Beca'}</h3>
            <div className="space-y-5">
              {!editingBeca && (
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Inscripción (Alumno + Taller) <span className="text-danger-500">*</span></label>
                  {form.inscripcion_id ? (
                    <div className="flex items-center gap-2 py-2.5 px-3 rounded-lg border border-accent-300 bg-accent-50 text-accent-700 text-sm font-semibold">
                      <span className="flex-1">
                        {inscripciones.find(i => String(i.id) === form.inscripcion_id)
                          ? (() => { const i = inscripciones.find(x => String(x.id) === form.inscripcion_id)!; return `${i.alumno.apellido}, ${i.alumno.nombre} — ${i.taller.nombre}`; })()
                          : 'Inscripción seleccionada'}
                      </span>
                      <button type="button" onClick={() => { setForm(prev => ({ ...prev, inscripcion_id: '' })); setSearchInsc(''); }}
                        className="text-accent-500 hover:text-accent-700 font-bold cursor-pointer text-lg leading-none">&times;</button>
                    </div>
                  ) : (
                    <>
                      <input type="text" placeholder="Buscar por nombre, apellido o DNI..." value={searchInsc}
                        onChange={e => setSearchInsc(e.target.value)}
                        className={`w-full py-2 px-3 rounded-lg border bg-card text-body text-sm mb-2 ${fieldErrors.inscripcion_id ? 'border-danger-400' : 'border-card'}`} />
                      <div style={{ maxHeight: '180px', overflowY: 'auto' }}
                        className="rounded-lg border border-card">
                        {inscripciones.length === 0 ? (
                          <p className="text-center text-muted text-sm py-4">No se encontraron inscripciones</p>
                        ) : (
                          inscripciones.map(i => (
                            <div key={i.id}
                              onClick={() => { setForm(prev => ({ ...prev, inscripcion_id: String(i.id) })); if (fieldErrors.inscripcion_id) setFieldErrors({ ...fieldErrors, inscripcion_id: '' }); }}
                              style={{ cursor: 'pointer' }}
                              className="w-full text-left px-3 py-2.5 text-sm border-b border-card last:border-b-0 hover:bg-accent-50 hover:text-accent-700 text-body">
                              {i.alumno.apellido}, {i.alumno.nombre} — {i.taller.nombre}
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                  {fieldErrors.inscripcion_id && <p className="mt-1 text-xs text-danger-500">{fieldErrors.inscripcion_id}</p>}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">% Descuento <span className="text-danger-500">*</span></label>
                <input type="number" min="1" max="100" value={form.porcentaje_descuento}
                  onChange={e => { setForm({ ...form, porcentaje_descuento: e.target.value }); if (fieldErrors.porcentaje_descuento) setFieldErrors({ ...fieldErrors, porcentaje_descuento: '' }); }}
                  className={`w-full py-2.5 px-3 rounded-lg border bg-card text-body text-sm font-medium ${fieldErrors.porcentaje_descuento ? 'border-danger-400' : 'border-card'}`} placeholder="50" />
                {fieldErrors.porcentaje_descuento && <p className="mt-1 text-xs text-danger-500">{fieldErrors.porcentaje_descuento}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Motivo (opcional)</label>
                <input type="text" value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium" placeholder="Situación económica, mérito deportivo..." />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Desde <span className="text-danger-500">*</span></label>
                  <input type="date" value={form.fecha_inicio}
                    onChange={e => { setForm({ ...form, fecha_inicio: e.target.value }); if (fieldErrors.fecha_inicio) setFieldErrors({ ...fieldErrors, fecha_inicio: '' }); }}
                    className={`w-full py-2.5 px-3 rounded-lg border bg-card text-body text-sm font-medium ${fieldErrors.fecha_inicio ? 'border-danger-400' : 'border-card'}`} />
                  {fieldErrors.fecha_inicio && <p className="mt-1 text-xs text-danger-500">{fieldErrors.fecha_inicio}</p>}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Hasta <span className="text-danger-500">*</span></label>
                  <input type="date" value={form.fecha_fin}
                    onChange={e => { setForm({ ...form, fecha_fin: e.target.value }); if (fieldErrors.fecha_fin) setFieldErrors({ ...fieldErrors, fecha_fin: '' }); }}
                    className={`w-full py-2.5 px-3 rounded-lg border bg-card text-body text-sm font-medium ${fieldErrors.fecha_fin ? 'border-danger-400' : 'border-card'}`} />
                  {fieldErrors.fecha_fin && <p className="mt-1 text-xs text-danger-500">{fieldErrors.fecha_fin}</p>}
                </div>
              </div>
              {/* Checkbox aplicar a cuota actual */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-accent-50 border border-accent-200 cursor-pointer select-none">
                <input type="checkbox" checked={form.aplicar_cuota_actual}
                  onChange={e => setForm({ ...form, aplicar_cuota_actual: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-accent-300 text-accent-500 accent-accent-500 cursor-pointer" />
                <div>
                  <span className="text-sm font-semibold text-accent-700 block">Aplicar a la cuota actual</span>
                  <span className="text-xs text-accent-600/70">Si el alumno tiene una cuota pendiente de este mes, se le recalcula el monto con el nuevo descuento</span>
                </div>
              </label>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-card text-body font-semibold hover:bg-surface transition-colors cursor-pointer text-sm">
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer text-sm">
                {loading ? 'Guardando...' : editingBeca ? 'Actualizar' : 'Crear Beca'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
