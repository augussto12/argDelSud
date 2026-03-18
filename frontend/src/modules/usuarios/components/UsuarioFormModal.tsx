import Modal from '../../../shared/components/Modal';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import type { Usuario, Rol } from '../hooks/useUsuarios';

interface Props {
  editing: Usuario | null;
  form: { nombre: string; email: string; password: string; rol_id: string };
  setForm: (f: any) => void;
  roles: Rol[];
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  fieldErrors: Record<string, string>;
  setFieldErrors: (f: any) => void;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function UsuarioFormModal({
  editing, form, setForm, roles,
  showPassword, setShowPassword,
  fieldErrors, setFieldErrors, loading,
  onClose, onSubmit,
}: Props) {
  return (
    <Modal open onClose={onClose} title={editing ? 'Editar Usuario' : 'Nuevo Usuario'} maxWidth="max-w-md">
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
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-card text-body font-semibold hover:bg-surface transition-colors cursor-pointer text-sm">
          Cancelar
        </button>
        <button onClick={onSubmit} disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer text-sm">
          {loading ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Usuario'}
        </button>
      </div>
    </Modal>
  );
}
