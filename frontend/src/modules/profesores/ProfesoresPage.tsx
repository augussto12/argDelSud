import { useEffect, useState } from 'react';
import api from '../../shared/api/client';
import type { Profesor, ApiResponse } from '../../shared/types';
import { Plus, Search, Pencil, Ban, X, GraduationCap } from 'lucide-react';
import TableLoader from '../../shared/components/TableLoader';
import { useToastStore } from '../../shared/hooks/useToastStore';

export default function ProfesoresPage() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Profesor | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { activo: 'true' };
      if (search) params.search = search;
      const res = await api.get<ApiResponse<Profesor[]>>('/profesores', { params });
      setProfesores(res.data.data);
    } catch { /* API not running yet */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Desactivar este profesor?')) return;
    try {
      await api.delete(`/profesores/${id}`);
      useToastStore.getState().success('Profesor desactivado');
      fetchData();
    } catch {
      useToastStore.getState().error('Error al desactivar profesor');
    }
  };

  return (
    <div className="animate-slideUp space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Profesores</h1>
          <p className="text-sm text-muted mt-0.5">Gestión del cuerpo docente</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors cursor-pointer shadow-sm">
          <Plus size={16} /> Nuevo Profesor
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" />
        <input type="text" placeholder="Buscar por nombre, apellido o DNI..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-input border-input text-sm text-heading placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-400 transition-colors" />
      </div>

      <div className="bg-card border border-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-card">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Apellido</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted hidden md:table-cell">DNI</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted hidden lg:table-cell">Especialidad</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted hidden lg:table-cell">Talleres</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableLoader colSpan={6} text="Cargando profesores..." />
              ) : profesores.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-muted">
                  <GraduationCap size={32} className="inline-block mb-2 text-secondary-200" /><br />No se encontraron profesores
                </td></tr>
              ) : (
                profesores.map((p) => (
                  <tr key={p.id} className="border-b border-card hover-row transition-colors">
                    <td className="px-4 py-3 font-semibold text-heading">{p.apellido}</td>
                    <td className="px-4 py-3 text-body">{p.nombre}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <code className="text-xs bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded-md">{p.dni}</code>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-body">{p.especialidad || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {p.talleres?.map(t => (
                          <span key={t.id} className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning-50 text-warning-500">{t.nombre}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(p); setShowForm(true); }}
                          className="p-2 rounded-lg text-accent-400 hover:bg-accent-50 transition-colors cursor-pointer" title="Editar">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(p.id)}
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

      {showForm && <ProfesorFormModal profesor={editing} onClose={() => setShowForm(false)} onSaved={fetchData} />}
    </div>
  );
}

function ProfesorFormModal({ profesor, onClose, onSaved }: { profesor: Profesor | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = profesor !== null;
  const [form, setForm] = useState({
    nombre: profesor?.nombre || '', apellido: profesor?.apellido || '', dni: profesor?.dni || '',
    especialidad: profesor?.especialidad || '', telefono: profesor?.telefono || '', email: profesor?.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (form.telefono && !/^\d*$/.test(form.telefono)) errs.telefono = 'Solo números';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setServerError('');
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) await api.put(`/profesores/${profesor!.id}`, form);
      else await api.post('/profesores', form);
      useToastStore.getState().success(isEdit ? 'Profesor editado exitosamente' : 'Profesor creado exitosamente');
      onSaved(); onClose();
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        const errs: Record<string, string> = {};
        data.errors.forEach((e: any) => { errs[e.campo] = e.mensaje; });
        setFieldErrors(errs);
      } else {
        setServerError(data?.message || 'Error al guardar');
      }
    }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn" onClick={onClose}>
      <div className="bg-card border border-card rounded-2xl w-full max-w-lg p-6 animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-heading">{isEdit ? 'Editar Profesor' : 'Nuevo Profesor'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-secondary-400 hover:bg-secondary-100 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
        {serverError && <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-danger-50 text-danger-600 border border-danger-100">{serverError}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FF label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required maxLength={100} error={fieldErrors.nombre} placeholder="Ej: Carlos" />
            <FF label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} required maxLength={100} error={fieldErrors.apellido} placeholder="Ej: López" />
            <FF label="DNI" name="dni" value={form.dni} onChange={handleChange} required maxLength={9} inputMode="numeric" onInput={digitsOnly} error={fieldErrors.dni} placeholder="Ej: 30567890" />
            <FF label="Especialidad" name="especialidad" value={form.especialidad} onChange={handleChange} maxLength={100} placeholder="Ej: Fútbol" />
            <FF label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} maxLength={15} inputMode="numeric" onInput={digitsOnly} error={fieldErrors.telefono} placeholder="Ej: 2236001234" />
            <FF label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={fieldErrors.email} placeholder="Ej: carlos@email.com" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-card text-sm font-medium text-body hover:bg-secondary-50 transition-colors cursor-pointer">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors cursor-pointer">
              {saving ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FF({ label, name, value, onChange, type = 'text', required = false, maxLength, inputMode, onInput, error, placeholder }: {
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

