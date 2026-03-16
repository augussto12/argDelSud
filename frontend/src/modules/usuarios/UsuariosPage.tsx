import { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Pencil, UserX, ChevronDown, Eye, EyeOff } from 'lucide-react';
import api from '../../shared/api/client';
import TableLoader from '../../shared/components/TableLoader';
import { useToastStore } from '../../shared/hooks/useToastStore';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  creado_at: string;
  rol: { id: number; nombre: string };
}

interface Rol {
  id: number;
  nombre: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol_id: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchUsuarios = useCallback(async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      const { data } = await api.get('/usuarios', { params });
      setUsuarios(data.data || []);
    } catch { setUsuarios([]); }
    finally { setLoadingPage(false); }
  }, [search]);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);
  useEffect(() => {
    api.get('/usuarios/roles').then(r => setRoles(r.data.data || [])).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', email: '', password: '', rol_id: roles[0]?.id?.toString() || '' });
    setShowPassword(false);
    setShowModal(true);
  };

  const openEdit = (u: Usuario) => {
    setEditing(u);
    setForm({ nombre: u.nombre, email: u.email, password: '', rol_id: u.rol.id.toString() });
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    // Per-field validation
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    else if (form.nombre.trim().length < 2) errs.nombre = 'Mínimo 2 caracteres';
    if (!form.email.trim()) errs.email = 'El email es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Formato de email inválido';
    if (!editing && !form.password) errs.password = 'La contraseña es obligatoria';
    else if (form.password && form.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (!form.rol_id) errs.rol_id = 'Seleccioná un rol';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      if (editing) {
        const payload: any = {
          nombre: form.nombre,
          email: form.email,
          rol_id: parseInt(form.rol_id),
        };
        if (form.password) payload.password = form.password;
        await api.put(`/usuarios/${editing.id}`, payload);
        useToastStore.getState().success('Usuario actualizado exitosamente');
      } else {
        await api.post('/usuarios', {
          nombre: form.nombre,
          email: form.email,
          password: form.password,
          rol_id: parseInt(form.rol_id),
        });
        useToastStore.getState().success('Usuario creado exitosamente');
      }
      setShowModal(false);
      fetchUsuarios();
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        const srvErrs: Record<string, string> = {};
        data.errors.forEach((e: any) => { srvErrs[e.campo] = e.mensaje; });
        setFieldErrors(srvErrs);
      } else {
        const msg = data?.message;
        if (msg?.includes('email')) setFieldErrors({ email: 'Ya existe un usuario con ese email.' });
        else useToastStore.getState().error(msg || 'Error al guardar.');
      }
    } finally { setLoading(false); }
  };

  const handleDesactivar = async (id: number) => {
    if (!confirm('¿Seguro que querés desactivar este usuario?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      useToastStore.getState().success('Usuario desactivado');
      fetchUsuarios();
    } catch (err: any) {
      useToastStore.getState().error(err.response?.data?.message || 'Error al desactivar');
    }
  };

  const rolBadge = (rol: string) => {
    const styles: Record<string, string> = {
      superadmin: 'bg-danger-100 text-danger-700',
      admin: 'bg-accent-100 text-accent-700',
      profesor: 'bg-success-100 text-success-700',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[rol] || 'bg-secondary-100 text-secondary-600'}`}>
        {rol.charAt(0).toUpperCase() + rol.slice(1)}
      </span>
    );
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Usuarios</h1>
          <p className="text-muted text-sm mt-1">Gestión de usuarios del sistema</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-400 hover:from-accent-600 hover:to-accent-500 text-white font-semibold rounded-xl shadow-lg shadow-accent-500/20 transition-all hover:-translate-y-0.5 cursor-pointer text-sm">
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {mensaje && (
        <div className="mb-4 p-3 rounded-xl bg-card border border-card text-sm font-medium text-body animate-slideUp cursor-pointer" onClick={() => setMensaje('')}>
          {mensaje}
        </div>
      )}

      {/* Search */}
      <div className="bg-card border border-card rounded-xl p-4 mb-6">
        <input type="text" placeholder="Buscar por nombre o email..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full py-2.5 px-4 rounded-lg border border-card bg-card text-body text-sm font-medium placeholder:text-muted" />
      </div>

      {/* Table */}
      <div className="bg-card border border-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card bg-surface">
                <th className="text-left px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Nombre</th>
                <th className="text-left px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Email</th>
                <th className="text-center px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Rol</th>
                <th className="text-center px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Estado</th>
                <th className="text-center px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Creado</th>
                <th className="text-right px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loadingPage ? (
                <TableLoader colSpan={6} text="Cargando usuarios..." />
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Shield className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-muted font-medium">No se encontraron usuarios</p>
                  </td>
                </tr>
              ) : (
                usuarios.map(u => (
                  <tr key={u.id} className="border-b border-card hover-row transition-colors">
                    <td className="px-4 py-3 font-medium text-heading">{u.nombre}</td>
                    <td className="px-4 py-3 text-body">{u.email}</td>
                    <td className="px-4 py-3 text-center">{rolBadge(u.rol.nombre)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.activo ? 'bg-success-100 text-success-700' : 'bg-secondary-200 text-secondary-600'
                      }`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted">{new Date(u.creado_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)}
                          className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer" title="Editar">
                          <Pencil className="w-4 h-4 text-muted" />
                        </button>
                        {u.activo && (
                          <button onClick={() => handleDesactivar(u.id)}
                            className="p-1.5 rounded-lg hover:bg-danger-50 transition-colors cursor-pointer" title="Desactivar">
                            <UserX className="w-4 h-4 text-danger-500" />
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

      {/* ═══ Modal: Crear/Editar Usuario ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slideUp border border-card">
            <h3 className="text-xl font-bold text-heading mb-6">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Nombre <span className="text-danger-500">*</span></label>
                <input type="text" value={form.nombre} maxLength={100} placeholder="Ej: Juan Pérez"
                  onChange={e => { setForm({ ...form, nombre: e.target.value }); if (fieldErrors.nombre) setFieldErrors({ ...fieldErrors, nombre: '' }); }}
                  className={`w-full py-2.5 px-3 rounded-lg border bg-card text-body text-sm font-medium ${fieldErrors.nombre ? 'border-danger-400' : 'border-card'}`} />
                {fieldErrors.nombre && <p className="mt-1 text-xs text-danger-500">{fieldErrors.nombre}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Email <span className="text-danger-500">*</span></label>
                <input type="email" value={form.email} maxLength={100} placeholder="Ej: juan@email.com"
                  onChange={e => { setForm({ ...form, email: e.target.value }); if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' }); }}
                  className={`w-full py-2.5 px-3 rounded-lg border bg-card text-body text-sm font-medium ${fieldErrors.email ? 'border-danger-400' : 'border-card'}`} />
                {fieldErrors.email && <p className="mt-1 text-xs text-danger-500">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                  Contraseña {!editing && <span className="text-danger-500">*</span>} {editing && <span className="normal-case font-normal">(dejar vacío para no cambiar)</span>}
                </label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={form.password} maxLength={100}
                    onChange={e => { setForm({ ...form, password: e.target.value }); if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' }); }}
                    className={`w-full py-2.5 px-3 pr-10 rounded-lg border bg-card text-body text-sm font-medium ${fieldErrors.password ? 'border-danger-400' : 'border-card'}`}
                    placeholder={editing ? '••••••' : 'Mínimo 6 caracteres'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-body cursor-pointer">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="mt-1 text-xs text-danger-500">{fieldErrors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Rol <span className="text-danger-500">*</span></label>
                <div className="relative">
                  <select value={form.rol_id} onChange={e => setForm({ ...form, rol_id: e.target.value })}
                    className="w-full py-2.5 pl-3 pr-8 rounded-lg border border-card bg-card text-body text-sm font-medium appearance-none cursor-pointer">
                    {roles.map(r => <option key={r.id} value={r.id}>{r.nombre.charAt(0).toUpperCase() + r.nombre.slice(1)}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-card text-body font-semibold hover:bg-surface transition-colors cursor-pointer text-sm">
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer text-sm">
                {loading ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
