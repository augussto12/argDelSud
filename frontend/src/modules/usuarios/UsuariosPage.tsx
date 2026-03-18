import { Shield, Plus, Pencil, UserX } from 'lucide-react';
import Spinner from '../../shared/components/Spinner';
import TableLoader from '../../shared/components/TableLoader';
import TablePagination from '../../shared/components/TablePagination';
import { useUsuarios } from './hooks/useUsuarios';
import UsuarioFormModal from './components/UsuarioFormModal';

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

export default function UsuariosPage() {
  const u = useUsuarios();

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Usuarios</h1>
          <p className="text-muted text-sm mt-1">Gestión de usuarios del sistema</p>
        </div>
        <button onClick={u.openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-400 hover:from-accent-600 hover:to-accent-500 text-white font-semibold rounded-xl shadow-lg shadow-accent-500/20 transition-all hover:-translate-y-0.5 cursor-pointer text-sm">
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {u.mensaje && (
        <div className="mb-4 p-3 rounded-xl bg-card border border-card text-sm font-medium text-body animate-slideUp cursor-pointer" onClick={() => u.setMensaje('')}>
          {u.mensaje}
        </div>
      )}

      <div className="bg-card border border-card rounded-xl p-4 mb-6">
        <input type="text" placeholder="Buscar por nombre o email..." value={u.search} onChange={e => u.setSearch(e.target.value)}
          className="w-full py-2.5 px-4 rounded-lg border border-card bg-card text-body text-sm font-medium placeholder:text-muted" />
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {u.loadingPage ? (
          <Spinner text="Cargando usuarios..." />
        ) : u.usuarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <Shield size={32} className="mb-2 text-secondary-200" />
            <p>No se encontraron usuarios</p>
          </div>
        ) : (
          u.paginatedUsuarios.map(usr => (
            <div key={usr.id} className="bg-card border border-card rounded-xl p-4 space-y-2 animate-fadeIn">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-heading truncate">{usr.nombre}</p>
                  <p className="text-xs text-muted truncate">{usr.email}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => u.openEdit(usr)}
                    className="tap-target rounded-lg text-muted hover:bg-surface transition-colors cursor-pointer" title="Editar">
                    <Pencil size={18} />
                  </button>
                  {usr.activo && (
                    <button onClick={() => u.handleDesactivar(usr.id)}
                      className="tap-target rounded-lg text-danger-500 hover:bg-danger-50 transition-colors cursor-pointer" title="Desactivar">
                      <UserX size={18} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {rolBadge(usr.rol.nombre)}
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  usr.activo ? 'bg-success-100 text-success-700' : 'bg-secondary-200 text-secondary-600'
                }`}>
                  {usr.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
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
                <th className="text-left px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Email</th>
                <th className="text-center px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Rol</th>
                <th className="text-center px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Estado</th>
                <th className="text-center px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Creado</th>
                <th className="text-right px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {u.loadingPage ? (
                <TableLoader colSpan={6} text="Cargando usuarios..." />
              ) : u.usuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Shield className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-muted font-medium">No se encontraron usuarios</p>
                  </td>
                </tr>
              ) : (
                u.paginatedUsuarios.map(usr => (
                  <tr key={usr.id} className="border-b border-card hover-row transition-colors">
                    <td className="px-4 py-3 font-medium text-heading">{usr.nombre}</td>
                    <td className="px-4 py-3 text-body">{usr.email}</td>
                    <td className="px-4 py-3 text-center">{rolBadge(usr.rol.nombre)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        usr.activo ? 'bg-success-100 text-success-700' : 'bg-secondary-200 text-secondary-600'
                      }`}>
                        {usr.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted">{new Date(usr.creado_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => u.openEdit(usr)}
                          className="tap-target rounded-lg hover:bg-surface transition-colors cursor-pointer" title="Editar">
                          <Pencil className="w-4 h-4 text-muted" />
                        </button>
                        {usr.activo && (
                          <button onClick={() => u.handleDesactivar(usr.id)}
                            className="tap-target rounded-lg hover:bg-danger-50 transition-colors cursor-pointer" title="Desactivar">
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

      <div className="bg-card border border-card rounded-xl overflow-hidden mt-3">
        <TablePagination
          currentPage={u.page}
          totalItems={u.usuarios.length}
          pageSize={u.pageSize}
          onPageChange={u.setPage}
          onPageSizeChange={u.setPageSize}
        />
      </div>

      {u.showModal && (
        <UsuarioFormModal
          editing={u.editing}
          form={u.form}
          setForm={u.setForm}
          roles={u.roles}
          showPassword={u.showPassword}
          setShowPassword={u.setShowPassword}
          fieldErrors={u.fieldErrors}
          setFieldErrors={u.setFieldErrors}
          loading={u.loading}
          onClose={() => u.setShowModal(false)}
          onSubmit={u.handleSubmit}
        />
      )}
    </div>
  );
}
