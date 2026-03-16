import { useEffect, useState, useCallback } from 'react';
import api from '../../shared/api/client';
import type { Taller, Dia, ApiResponse } from '../../shared/types';
import {
  Search, Loader2, Building2, Clock, User, Plus, Pencil, Trash2,
  Eye, UserPlus, ChevronDown, X
} from 'lucide-react';

interface Profesor { id: number; nombre: string; apellido: string }
interface DiaForm { dia_id: number; hora_inicio: string; hora_fin: string }
interface InscriptoInfo { id: number; nombre: string; apellido: string; dni: string }

const EMPTY_FORM = {
  nombre: '', categoria: 'Deportes', precio_mensual: '', cupo_maximo: '30',
  profesor_id: '', fecha_inicio: '', fecha_fin: '',
};

const CATEGORIAS = ['Deportes', 'Arte', 'Música', 'Educación', 'Otro'];

export default function TalleresPage() {
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [dias, setDias] = useState<Dia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Taller | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [diasForm, setDiasForm] = useState<DiaForm[]>([]);
  const [showDetalle, setShowDetalle] = useState(false);
  const [detalleTaller, setDetalleTaller] = useState<any>(null);
  const [showInscribir, setShowInscribir] = useState(false);
  const [inscribirTallerId, setInscribirTallerId] = useState<number | null>(null);
  const [alumnos, setAlumnos] = useState<InscriptoInfo[]>([]);
  const [alumnoSearch, setAlumnoSearch] = useState('');
  const [savingLoad, setSavingLoad] = useState(false);
  const [mensaje, setMensaje] = useState('');

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

  useEffect(() => { fetchTalleres(); }, [fetchTalleres]);

  useEffect(() => {
    api.get('/profesores?activo=true').then(r => setProfesores(r.data.data || [])).catch(() => {});
    api.get('/talleres/dias').then(r => setDias(r.data.data || [])).catch(() => {});
  }, []);

  // ─── Create / Edit ─────────────────────────────────────────

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, profesor_id: profesores[0]?.id?.toString() || '' });
    setDiasForm([{ dia_id: 1, hora_inicio: '09:00', hora_fin: '10:00' }]);
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
        setMensaje('✅ Taller actualizado');
      } else {
        await api.post('/talleres', payload);
        setMensaje('✅ Taller creado');
      }
      setShowModal(false);
      fetchTalleres();
    } catch (err: any) {
      setMensaje(`❌ ${err.response?.data?.message || 'Error al guardar'}`);
    } finally { setSavingLoad(false); }
  };

  const handleDesactivar = async (id: number) => {
    if (!confirm('¿Seguro que querés desactivar este taller?')) return;
    try {
      await api.delete(`/talleres/${id}`);
      setMensaje('✅ Taller desactivado');
      fetchTalleres();
    } catch (err: any) {
      setMensaje(`❌ ${err.response?.data?.message || 'Error'}`);
    }
  };

  // ─── Detalle ───────────────────────────────────────────────

  const openDetalle = async (id: number) => {
    try {
      const { data } = await api.get(`/talleres/${id}`);
      setDetalleTaller(data.data);
      setShowDetalle(true);
    } catch { setMensaje('❌ Error cargando detalle'); }
  };

  // ─── Inscribir ─────────────────────────────────────────────

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

  useEffect(() => {
    if (showInscribir) {
      const timeout = setTimeout(() => fetchAlumnos(alumnoSearch), 300);
      return () => clearTimeout(timeout);
    }
  }, [alumnoSearch, showInscribir]);

  const handleInscribir = async (alumnoId: number) => {
    if (!inscribirTallerId) return;
    try {
      await api.post(`/talleres/${inscribirTallerId}/inscribir`, { alumno_id: alumnoId });
      setMensaje('✅ Alumno inscripto');
      setShowInscribir(false);
      fetchTalleres();
    } catch (err: any) {
      setMensaje(`❌ ${err.response?.data?.message || 'Error al inscribir'}`);
    }
  };

  const handleDesinscribir = async (tallerId: number, alumnoId: number) => {
    if (!confirm('¿Desinscribir al alumno?')) return;
    try {
      await api.delete(`/talleres/${tallerId}/desinscribir/${alumnoId}`);
      setMensaje('✅ Alumno desinscripto');
      openDetalle(tallerId); // refresh detail
      fetchTalleres();
    } catch (err: any) {
      setMensaje(`❌ ${err.response?.data?.message || 'Error'}`);
    }
  };

  return (
    <div className="animate-slideUp space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Talleres</h1>
          <p className="text-sm text-muted mt-0.5">Actividades y cursos del club</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-400 hover:from-accent-600 hover:to-accent-500 text-white font-semibold rounded-xl shadow-lg shadow-accent-500/20 transition-all hover:-translate-y-0.5 cursor-pointer text-sm">
          <Plus className="w-4 h-4" />
          Nuevo Taller
        </button>
      </div>

      {mensaje && (
        <div className="p-3 rounded-xl bg-card border border-card text-sm font-medium text-body animate-slideUp cursor-pointer" onClick={() => setMensaje('')}>
          {mensaje}
        </div>
      )}

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" />
        <input type="text" placeholder="Buscar taller..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-input border-input text-sm text-heading placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-400 transition-colors" />
      </div>

      {/* ═══ Cards grid ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted">
            <Loader2 size={24} className="animate-spin mb-2 text-accent-400" />
            Cargando talleres...
          </div>
        ) : talleres.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted">
            <Building2 size={36} className="mb-2 text-secondary-200" />
            No se encontraron talleres
          </div>
        ) : (
          talleres.map((t) => {
            const inscritos = t._count?.inscripciones ?? 0;
            const pct = Math.min(100, (inscritos / t.cupo_maximo) * 100);
            const isFull = pct >= 90;

            return (
              <div key={t.id} className="bg-card border border-card rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-1 bg-gradient-to-r from-accent-400 to-warning-400" />
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-heading leading-tight">{t.nombre}</h3>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-accent-50 text-accent-500">{t.categoria}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-warning-400">${Number(t.precio_mensual).toLocaleString('es-AR')}</p>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">/ mes</p>
                    </div>
                  </div>

                  {t.profesor && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-400 to-warning-400 flex items-center justify-center">
                        <User size={12} className="text-white" />
                      </div>
                      <span className="text-sm text-body">{t.profesor.nombre} {t.profesor.apellido}</span>
                    </div>
                  )}

                  {t.tallerDias && t.tallerDias.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {t.tallerDias.map((td) => (
                        <span key={td.dia_id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-secondary-50 text-secondary-600">
                          <Clock size={11} />
                          {td.dia?.nombre} {td.hora_inicio?.slice(11, 16)}-{td.hora_fin?.slice(11, 16)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-card">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-muted">Inscriptos</span>
                      <span className={`text-xs font-bold ${isFull ? 'text-danger-500' : 'text-body'}`}>
                        {inscritos}/{t.cupo_maximo}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-secondary-100 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-danger-500' : 'bg-gradient-to-r from-accent-400 to-success-400'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-1">
                    <button onClick={() => openDetalle(t.id)} className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer" title="Ver detalle">
                      <Eye className="w-4 h-4 text-muted" />
                    </button>
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer" title="Editar">
                      <Pencil className="w-4 h-4 text-muted" />
                    </button>
                    <button onClick={() => openInscribir(t.id)} className="p-1.5 rounded-lg hover:bg-success-50 transition-colors cursor-pointer" title="Inscribir alumno">
                      <UserPlus className="w-4 h-4 text-success-500" />
                    </button>
                    <button onClick={() => handleDesactivar(t.id)} className="p-1.5 rounded-lg hover:bg-danger-50 transition-colors cursor-pointer ml-auto" title="Desactivar">
                      <Trash2 className="w-4 h-4 text-danger-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ═══ Modal: Crear / Editar Taller ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-slideUp border border-card max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-heading mb-6">{editing ? 'Editar Taller' : 'Nuevo Taller'}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Nombre</label>
                  <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium" placeholder="Ej: Fútbol Sub-12" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Categoría</label>
                  <div className="relative">
                    <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}
                      className="w-full py-2.5 pl-3 pr-8 rounded-lg border border-card bg-card text-body text-sm font-medium appearance-none cursor-pointer">
                      {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Precio Mensual ($)</label>
                  <input type="number" value={form.precio_mensual} onChange={e => setForm({ ...form, precio_mensual: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium" placeholder="10000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Cupo Máximo</label>
                  <input type="number" value={form.cupo_maximo} onChange={e => setForm({ ...form, cupo_maximo: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Profesor</label>
                  <div className="relative">
                    <select value={form.profesor_id} onChange={e => setForm({ ...form, profesor_id: e.target.value })}
                      className="w-full py-2.5 pl-3 pr-8 rounded-lg border border-card bg-card text-body text-sm font-medium appearance-none cursor-pointer">
                      <option value="">Seleccionar...</option>
                      {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Fecha Inicio</label>
                  <input type="date" value={form.fecha_inicio} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Fecha Fin</label>
                  <input type="date" value={form.fecha_fin} onChange={e => setForm({ ...form, fecha_fin: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium" />
                </div>
              </div>

              {/* Días y horarios */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Días y Horarios</label>
                  <button type="button" onClick={addDia} className="text-xs text-accent-500 hover:text-accent-600 font-semibold cursor-pointer">+ Agregar día</button>
                </div>
                <div className="space-y-2">
                  {diasForm.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 bg-surface rounded-lg p-2.5">
                      <div className="relative flex-1">
                        <select value={d.dia_id} onChange={e => updateDia(i, 'dia_id', e.target.value)}
                          className="w-full py-1.5 pl-2 pr-6 rounded border border-card bg-card text-body text-xs font-medium appearance-none cursor-pointer">
                          {dias.map(dia => <option key={dia.id} value={dia.id}>{dia.nombre}</option>)}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted pointer-events-none" />
                      </div>
                      <input type="time" value={d.hora_inicio} onChange={e => updateDia(i, 'hora_inicio', e.target.value)}
                        className="py-1.5 px-2 rounded border border-card bg-card text-body text-xs font-medium w-24" />
                      <span className="text-xs text-muted">a</span>
                      <input type="time" value={d.hora_fin} onChange={e => updateDia(i, 'hora_fin', e.target.value)}
                        className="py-1.5 px-2 rounded border border-card bg-card text-body text-xs font-medium w-24" />
                      {diasForm.length > 1 && (
                        <button type="button" onClick={() => removeDia(i)} className="p-1 rounded hover:bg-danger-50 cursor-pointer">
                          <X className="w-3.5 h-3.5 text-danger-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-card text-body font-semibold hover:bg-surface transition-colors cursor-pointer text-sm">
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={savingLoad || !form.nombre || !form.precio_mensual || !form.profesor_id || !form.fecha_inicio || !form.fecha_fin || diasForm.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer text-sm">
                {savingLoad ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Taller'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Modal: Detalle con inscriptos ═══ */}
      {showDetalle && detalleTaller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDetalle(false)} />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-slideUp border border-card max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-heading mb-1">{detalleTaller.nombre}</h3>
            <p className="text-sm text-muted mb-5">{detalleTaller.categoria} · {detalleTaller.profesor?.nombre} {detalleTaller.profesor?.apellido}</p>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-surface rounded-xl p-3 text-center">
                <p className="text-xs text-muted font-semibold uppercase mb-1">Precio</p>
                <p className="text-lg font-bold text-heading">${Number(detalleTaller.precio_mensual).toLocaleString()}</p>
              </div>
              <div className="bg-surface rounded-xl p-3 text-center">
                <p className="text-xs text-muted font-semibold uppercase mb-1">Cupo</p>
                <p className="text-lg font-bold text-heading">{detalleTaller.inscripciones?.length ?? 0}/{detalleTaller.cupo_maximo}</p>
              </div>
              <div className="bg-surface rounded-xl p-3 text-center">
                <p className="text-xs text-muted font-semibold uppercase mb-1">Días</p>
                <p className="text-lg font-bold text-heading">{detalleTaller.tallerDias?.length ?? 0}</p>
              </div>
            </div>

            {/* Schedule pills */}
            {detalleTaller.tallerDias && detalleTaller.tallerDias.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {detalleTaller.tallerDias.map((td: any, i: number) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-accent-50 text-accent-600 font-medium">
                    <Clock size={11} />
                    {td.dia?.nombre} {td.hora_inicio?.slice?.(11, 16) || td.hora_inicio} - {td.hora_fin?.slice?.(11, 16) || td.hora_fin}
                  </span>
                ))}
              </div>
            )}

            <h4 className="text-sm font-bold text-heading mb-3">Alumnos inscriptos</h4>
            {detalleTaller.inscripciones && detalleTaller.inscripciones.length > 0 ? (
              <div className="space-y-1.5">
                {detalleTaller.inscripciones.map((insc: any) => (
                  <div key={insc.alumno?.id || insc.id} className="flex items-center justify-between bg-surface rounded-lg px-4 py-2.5">
                    <div>
                      <span className="text-sm font-medium text-heading">{insc.alumno?.apellido}, {insc.alumno?.nombre}</span>
                      <span className="text-xs text-muted ml-2">DNI: {insc.alumno?.dni}</span>
                    </div>
                    <button onClick={() => handleDesinscribir(detalleTaller.id, insc.alumno?.id)}
                      className="text-xs text-danger-400 hover:text-danger-500 font-semibold cursor-pointer">
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted py-3 text-center">No hay alumnos inscriptos</p>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowDetalle(false); openInscribir(detalleTaller.id); }}
                className="flex-1 py-2.5 rounded-xl bg-success-500 hover:bg-success-600 text-white font-semibold transition-colors cursor-pointer text-sm">
                Inscribir Alumno
              </button>
              <button onClick={() => setShowDetalle(false)} className="flex-1 py-2.5 rounded-xl border border-card text-body font-semibold hover:bg-surface transition-colors cursor-pointer text-sm">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Modal: Inscribir alumno ═══ */}
      {showInscribir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowInscribir(false)} />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slideUp border border-card">
            <h3 className="text-xl font-bold text-heading mb-5">Inscribir Alumno</h3>
            <input type="text" placeholder="Buscar por nombre, apellido o DNI..." value={alumnoSearch}
              onChange={e => setAlumnoSearch(e.target.value)}
              className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium mb-3" />
            <div className="max-h-60 overflow-y-auto space-y-1">
              {alumnos.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">No se encontraron alumnos</p>
              ) : (
                alumnos.map(a => (
                  <button key={a.id} onClick={() => handleInscribir(a.id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-surface transition-colors cursor-pointer text-left">
                    <div>
                      <span className="text-sm font-medium text-heading">{a.apellido}, {a.nombre}</span>
                      <span className="text-xs text-muted ml-2">DNI: {a.dni}</span>
                    </div>
                    <UserPlus className="w-4 h-4 text-success-400" />
                  </button>
                ))
              )}
            </div>
            <button onClick={() => setShowInscribir(false)} className="w-full mt-4 py-2.5 rounded-xl border border-card text-body font-semibold hover:bg-surface transition-colors cursor-pointer text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
