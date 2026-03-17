import { useEffect, useState } from 'react';
import api from '../../shared/api/client';
import type { Alumno, ApiResponse } from '../../shared/types';
import { Plus, Search, Pencil, Ban, X, Users } from 'lucide-react';
import TableLoader from '../../shared/components/TableLoader';
import { useToastStore } from '../../shared/hooks/useToastStore';

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);

  const fetchAlumnos = async () => {
    setLoading(true);
    try {
      const params: any = { activo: 'true' };
      if (search) params.search = search;
      const res = await api.get<ApiResponse<Alumno[]>>('/alumnos', { params });
      setAlumnos(res.data?.data ?? []);
    } catch (_e) { setAlumnos([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAlumnos(); }, [search]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Desactivar este alumno?')) return;
    try {
      await api.delete(`/alumnos/${id}`);
      useToastStore.getState().success('Alumno desactivado');
      fetchAlumnos();
    } catch {
      useToastStore.getState().error('Error al desactivar alumno');
    }
  };

  return (
    <div className="animate-slideUp space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Alumnos</h1>
          <p className="text-sm text-muted mt-0.5">Gestión de alumnos del club</p>
        </div>
        <button onClick={() => { setEditingAlumno(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-400 hover:from-accent-600 hover:to-accent-500 text-white font-semibold rounded-xl shadow-lg shadow-accent-500/20 transition-all hover:-translate-y-0.5 cursor-pointer text-sm">
          <Plus size={16} /> Nuevo Alumno
        </button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" />
        <input type="text" placeholder="Buscar por nombre, apellido o DNI..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-input border-input text-sm text-heading placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-400 transition-colors" />
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="w-8 h-8 text-accent-500 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-muted font-medium text-sm">Cargando alumnos...</p>
          </div>
        ) : alumnos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <Users size={32} className="mb-2 text-secondary-200" />
            <p>No se encontraron alumnos</p>
          </div>
        ) : (
          alumnos.map((a) => (
            <div key={a.id} className="bg-card border border-card rounded-xl p-4 space-y-2 animate-fadeIn">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-heading truncate">{a.apellido}, {a.nombre}</p>
                  <code className="text-xs bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded-md">DNI: {a.dni}</code>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditingAlumno(a); setShowForm(true); }}
                    className="tap-target rounded-lg text-accent-400 hover:bg-accent-50 transition-colors cursor-pointer" title="Editar">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(a.id)}
                    className="tap-target rounded-lg text-danger-400 hover:bg-danger-50 transition-colors cursor-pointer" title="Desactivar">
                    <Ban size={18} />
                  </button>
                </div>
              </div>
              {a.telefono && <p className="text-sm text-body">📞 {a.telefono}</p>}
              {a.inscripciones?.filter(i => i.activa).length! > 0 && (
                <div className="flex flex-wrap gap-1">
                  {a.inscripciones?.filter(i => i.activa).map(i => (
                    <span key={i.id} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-50 text-accent-500">
                      {i.taller?.nombre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card border border-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-card">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Apellido</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">DNI</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted hidden lg:table-cell">Teléfono</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted hidden lg:table-cell">Talleres</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableLoader colSpan={6} text="Cargando alumnos..." />
              ) : alumnos.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-muted">
                  <Users size={32} className="inline-block mb-2 text-secondary-200" /><br />No se encontraron alumnos
                </td></tr>
              ) : (
                alumnos.map((a) => (
                  <tr key={a.id} className="border-b border-card hover-row transition-colors">
                    <td className="px-4 py-3 font-semibold text-heading">{a.apellido}</td>
                    <td className="px-4 py-3 text-body">{a.nombre}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded-md">{a.dni}</code>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-body">{a.telefono || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {a.inscripciones?.filter(i => i.activa).map(i => (
                          <span key={i.id} className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-50 text-accent-500">
                            {i.taller?.nombre}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditingAlumno(a); setShowForm(true); }}
                          className="tap-target rounded-lg text-accent-400 hover:bg-accent-50 transition-colors cursor-pointer" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(a.id)}
                          className="tap-target rounded-lg text-danger-400 hover:bg-danger-50 transition-colors cursor-pointer" title="Desactivar">
                          <Ban size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <AlumnoFormModal alumno={editingAlumno} onClose={() => setShowForm(false)} onSaved={fetchAlumnos} />}
    </div>
  );
}

/* ─── Modal Form ─────────────────────────────────────── */
function AlumnoFormModal({ alumno, onClose, onSaved }: { alumno: Alumno | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = alumno !== null;
  const [form, setForm] = useState({
    nombre: alumno?.nombre || '', apellido: alumno?.apellido || '', dni: alumno?.dni || '',
    fecha_nacimiento: alumno?.fecha_nacimiento?.split('T')[0] || '', telefono: alumno?.telefono || '',
    telefono_tutor: alumno?.telefono_tutor || '', nombre_tutor: alumno?.nombre_tutor || '',
    direccion: alumno?.direccion || '', notas: alumno?.notas || '',
  });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const digitsOnly = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    else if (form.nombre.trim().length < 2) errs.nombre = 'Mínimo 2 caracteres';
    if (!form.apellido.trim()) errs.apellido = 'El apellido es obligatorio';
    else if (form.apellido.trim().length < 2) errs.apellido = 'Mínimo 2 caracteres';
    if (!form.dni.trim()) errs.dni = 'El DNI es obligatorio';
    else if (form.dni.trim().length < 7) errs.dni = 'El DNI debe tener al menos 7 dígitos';
    else if (!/^\d+$/.test(form.dni.trim())) errs.dni = 'El DNI solo debe contener números';
    if (!form.fecha_nacimiento) errs.fecha_nacimiento = 'La fecha de nacimiento es obligatoria';
    if (form.telefono && !/^\d*$/.test(form.telefono)) errs.telefono = 'Solo números';
    if (form.telefono_tutor && !/^\d*$/.test(form.telefono_tutor)) errs.telefono_tutor = 'Solo números';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setServerError('');
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) await api.put(`/alumnos/${alumno!.id}`, form);
      else await api.post('/alumnos', form);
      useToastStore.getState().success(isEdit ? 'Alumno editado exitosamente' : 'Alumno creado exitosamente');
      onSaved(); onClose();
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        const errs: Record<string, string> = {};
        data.errors.forEach((e: any) => { errs[e.campo] = e.mensaje; });
        setFieldErrors(errs);
      } else {
        const msg = data?.message;
        if (msg?.includes('DNI')) setServerError('Ya existe un alumno con ese DNI.');
        else setServerError(msg || 'Error al guardar. Verificá los datos.');
      }
    }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-card border border-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-heading">{isEdit ? 'Editar Alumno' : 'Nuevo Alumno'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-secondary-400 hover:bg-secondary-100 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {serverError && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-danger-50 text-danger-600 border border-danger-100">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required maxLength={100} error={fieldErrors.nombre} placeholder="Ej: Juan" />
            <FormField label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} required maxLength={100} error={fieldErrors.apellido} placeholder="Ej: Pérez" />
            <FormField label="DNI" name="dni" value={form.dni} onChange={handleChange} required maxLength={9} inputMode="numeric" onInput={digitsOnly} error={fieldErrors.dni} placeholder="Ej: 42567890" />
            <FormField label="Fecha Nacimiento" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} required error={fieldErrors.fecha_nacimiento} />
            <FormField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} maxLength={15} inputMode="numeric" onInput={digitsOnly} error={fieldErrors.telefono} placeholder="Ej: 2236001234" />
            <FormField label="Tel. Tutor" name="telefono_tutor" value={form.telefono_tutor} onChange={handleChange} maxLength={15} inputMode="numeric" onInput={digitsOnly} error={fieldErrors.telefono_tutor} placeholder="Ej: 2236005678" />
          </div>
          <FormField label="Nombre Tutor" name="nombre_tutor" value={form.nombre_tutor} onChange={handleChange} maxLength={200} placeholder="Ej: María García" />
          <FormField label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} placeholder="Ej: Av. Colón 1234" />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Notas</label>
            <textarea name="notas" value={form.notas} onChange={handleChange} rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-input border-input text-sm text-heading placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-400 transition-colors resize-none" placeholder="Observaciones opcionales..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-card text-sm font-medium text-body hover:bg-secondary-50 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors cursor-pointer">
              {saving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Alumno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, name, value, onChange, type = 'text', required = false, maxLength, inputMode, onInput, error, placeholder }: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean; maxLength?: number; inputMode?: 'text' | 'numeric' | 'email' | 'tel';
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void; error?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
        {label} {required && <span className="text-danger-500">*</span>}
      </label>
      <input name={name} type={type} value={value} onChange={onChange} maxLength={maxLength}
        inputMode={inputMode} onInput={onInput} placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 rounded-xl border bg-input text-sm text-heading placeholder:text-secondary-400 focus:outline-none focus:ring-2 transition-colors ${error ? 'border-danger-400 focus:ring-danger-400/30 focus:border-danger-400' : 'border-input focus:ring-accent-400/30 focus:border-accent-400'}`} />
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  );
}

