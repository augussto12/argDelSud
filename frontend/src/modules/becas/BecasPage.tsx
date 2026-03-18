import { GraduationCap, Plus, Pencil, XCircle, ChevronDown } from 'lucide-react';
import Spinner from '../../shared/components/Spinner';
import TableLoader from '../../shared/components/TableLoader';
import TablePagination from '../../shared/components/TablePagination';
import { useBecas } from './hooks/useBecas';
import BecaFormModal from './components/BecaFormModal';

export default function BecasPage() {
  const b = useBecas();

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Becas</h1>
          <p className="text-muted text-sm mt-1">Gestión de descuentos y becas por inscripción</p>
        </div>
        <button onClick={b.openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-400 hover:from-accent-600 hover:to-accent-500 text-white font-semibold rounded-xl shadow-lg shadow-accent-500/20 transition-all hover:-translate-y-0.5 cursor-pointer text-sm">
          <Plus className="w-4 h-4" />
          Nueva Beca
        </button>
      </div>

      {b.mensaje && (
        <div className="mb-4 p-3 rounded-xl bg-card border border-card text-sm font-medium text-body animate-slideUp cursor-pointer" onClick={() => b.setMensaje('')}>
          {b.mensaje}
        </div>
      )}

      {/* Filtro estado */}
      <div className="bg-card border border-card rounded-xl p-4 mb-6 flex gap-3 items-end">
        <div className="w-36">
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Estado</label>
          <div className="relative">
            <select value={b.filtroActiva} onChange={e => b.setFiltroActiva(e.target.value)}
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
        {b.loadingPage ? (
          <Spinner text="Cargando becas..." />
        ) : b.becas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <GraduationCap size={32} className="mb-2 text-secondary-200" />
            <p>No se encontraron becas</p>
          </div>
        ) : (
          b.paginatedBecas.map(beca => (
            <div key={beca.id} className="bg-card border border-card rounded-xl p-4 space-y-2 animate-fadeIn">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-heading truncate">{beca.inscripcion.alumno.apellido}, {beca.inscripcion.alumno.nombre}</p>
                  <p className="text-xs text-muted">DNI: {beca.inscripcion.alumno.dni}</p>
                  <p className="text-xs text-body mt-0.5">{beca.inscripcion.taller.nombre}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => b.openEdit(beca)}
                    className="tap-target rounded-lg hover:bg-surface transition-colors cursor-pointer" title="Editar">
                    <Pencil className="w-4 h-4 text-muted" />
                  </button>
                  {beca.activa && (
                    <button onClick={() => b.handleDesactivar(beca.id)}
                      className="tap-target rounded-lg hover:bg-danger-50 transition-colors cursor-pointer" title="Desactivar">
                      <XCircle className="w-4 h-4 text-danger-500" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-accent-100 text-accent-700">
                  {parseFloat(beca.porcentaje_descuento)}%
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  beca.activa ? 'bg-success-100 text-success-700' : 'bg-secondary-200 text-secondary-600'
                }`}>
                  {beca.activa ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted">
                <span>{new Date(beca.fecha_inicio).toLocaleDateString()} — {new Date(beca.fecha_fin).toLocaleDateString()}</span>
              </div>
              {beca.motivo && <p className="text-xs text-body italic">{beca.motivo}</p>}
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
              {b.loadingPage ? (
                <TableLoader colSpan={8} text="Cargando becas..." />
              ) : b.becas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <GraduationCap className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-muted font-medium">No se encontraron becas</p>
                  </td>
                </tr>
              ) : (
                b.paginatedBecas.map(beca => (
                  <tr key={beca.id} className="border-b border-card hover-row transition-colors">
                    <td className="px-4 py-3 font-medium text-heading">
                      {beca.inscripcion.alumno.apellido}, {beca.inscripcion.alumno.nombre}
                      <span className="block text-xs text-muted">DNI: {beca.inscripcion.alumno.dni}</span>
                    </td>
                    <td className="px-4 py-3 text-body">{beca.inscripcion.taller.nombre}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-accent-100 text-accent-700">
                        {parseFloat(beca.porcentaje_descuento)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body text-sm">{beca.motivo || '—'}</td>
                    <td className="px-4 py-3 text-center text-sm text-body">{new Date(beca.fecha_inicio).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center text-sm text-body">{new Date(beca.fecha_fin).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        beca.activa ? 'bg-success-100 text-success-700' : 'bg-secondary-200 text-secondary-600'
                      }`}>
                        {beca.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => b.openEdit(beca)}
                          className="tap-target rounded-lg hover:bg-surface transition-colors cursor-pointer" title="Editar">
                          <Pencil className="w-4 h-4 text-muted" />
                        </button>
                        {beca.activa && (
                          <button onClick={() => b.handleDesactivar(beca.id)}
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

      <div className="bg-card border border-card rounded-xl overflow-hidden mt-3">
        <TablePagination
          currentPage={b.page}
          totalItems={b.becas.length}
          pageSize={b.pageSize}
          onPageChange={b.setPage}
          onPageSizeChange={b.setPageSize}
        />
      </div>

      {/* Modal */}
      {b.showModal && (
        <BecaFormModal
          editingBeca={b.editingBeca}
          form={b.form}
          setForm={b.setForm}
          inscripciones={b.inscripciones}
          searchInsc={b.searchInsc}
          setSearchInsc={b.setSearchInsc}
          fieldErrors={b.fieldErrors}
          setFieldErrors={b.setFieldErrors}
          loading={b.loading}
          onClose={() => b.setShowModal(false)}
          onSubmit={b.handleSubmit}
        />
      )}
    </div>
  );
}
