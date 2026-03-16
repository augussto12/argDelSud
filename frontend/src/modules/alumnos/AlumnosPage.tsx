import { useEffect, useState } from 'react';
import api from '../../shared/api/client';
import type { Alumno, ApiResponse } from '../../shared/types';
import { Plus, Search, Pencil, Ban, X, Loader2, Users } from 'lucide-react';

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
    await api.delete(`/alumnos/${id}`);
    fetchAlumnos();
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
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors cursor-pointer shadow-sm">
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

      {/* Table card */}
      <div className="bg-card border border-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-card">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Apellido</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted hidden md:table-cell">DNI</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted hidden lg:table-cell">Teléfono</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted hidden lg:table-cell">Talleres</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16 text-muted">
                  <Loader2 size={20} className="animate-spin inline-block mb-2 text-accent-400" /><br />Cargando...
                </td></tr>
              ) : alumnos.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-muted">
                  <Users size={32} className="inline-block mb-2 text-secondary-200" /><br />No se encontraron alumnos
                </td></tr>
              ) : (
                alumnos.map((a) => (
                  <tr key={a.id} className="border-b border-card hover-row transition-colors">
                    <td className="px-4 py-3 font-semibold text-heading">{a.apellido}</td>
                    <td className="px-4 py-3 text-body">{a.nombre}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
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
                          className="p-2 rounded-lg text-accent-400 hover:bg-accent-50 transition-colors cursor-pointer" title="Editar">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(a.id)}
                          className="p-2 rounded-lg text-danger-400 hover:bg-danger-50 transition-colors cursor-pointer" title="Desactivar">
                          <Ban size={15} />
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
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (!form.nombre.trim() || !form.apellido.trim() || !form.dni.trim() || !form.fecha_nacimiento) {
        setError('Completá todos los campos obligatorios (Nombre, Apellido, DNI, Fecha Nacimiento)');
        setSaving(false);
        return;
      }
      if (isEdit) await api.put(`/alumnos/${alumno!.id}`, form);
      else await api.post('/alumnos', form);
      onSaved(); onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg?.includes('DNI')) setError('Ya existe un alumno con ese DNI. Verificá los datos.');
      else setError(msg || 'Error al guardar. Verificá los datos e intentá de nuevo.');
    }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn" onClick={onClose}>
      <div className="bg-card border border-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-heading">{isEdit ? 'Editar Alumno' : 'Nuevo Alumno'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-secondary-400 hover:bg-secondary-100 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-danger-50 text-danger-600 border border-danger-100">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
            <FormField label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} required />
            <FormField label="DNI" name="dni" value={form.dni} onChange={handleChange} required />
            <FormField label="Fecha Nacimiento" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} required />
            <FormField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
            <FormField label="Tel. Tutor" name="telefono_tutor" value={form.telefono_tutor} onChange={handleChange} />
          </div>
          <FormField label="Nombre Tutor" name="nombre_tutor" value={form.nombre_tutor} onChange={handleChange} />
          <FormField label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Notas</label>
            <textarea name="notas" value={form.notas} onChange={handleChange} rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-input border-input text-sm text-heading placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-400 transition-colors resize-none" />
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

function FormField({ label, name, value, onChange, type = 'text', required = false }: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
        {label} {required && <span className="text-danger-500">*</span>}
      </label>
      <input name={name} type={type} value={value} onChange={onChange} required={required}
        className="w-full px-3.5 py-2.5 rounded-xl border bg-input border-input text-sm text-heading placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-400 transition-colors" />
    </div>
  );
}
