import { Search, Building2, Clock, User, Plus, Pencil, Trash2, Eye, UserPlus } from 'lucide-react';
import Spinner from '../../shared/components/Spinner';
import TablePagination from '../../shared/components/TablePagination';
import { useTalleres } from './hooks/useTalleres';
import TallerFormModal from './components/TallerFormModal';
import TallerDetalleModal from './components/TallerDetalleModal';
import InscribirAlumnoModal from './components/InscribirAlumnoModal';

export default function TalleresPage() {
  const t = useTalleres();

  return (
    <div className="animate-slideUp space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Talleres</h1>
          <p className="text-sm text-muted mt-0.5">Actividades y cursos del club</p>
        </div>
        <button onClick={t.openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-400 hover:from-accent-600 hover:to-accent-500 text-white font-semibold rounded-xl shadow-lg shadow-accent-500/20 transition-all hover:-translate-y-0.5 cursor-pointer text-sm">
          <Plus className="w-4 h-4" />
          Nuevo Taller
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" />
        <input type="text" placeholder="Buscar taller..." value={t.search} onChange={(e) => t.setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-input border-input text-sm text-heading placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-400 transition-colors" />
      </div>

      {/* ═══ Cards grid ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {t.loading ? (
          <div className="col-span-full"><Spinner text="Cargando talleres..." /></div>
        ) : t.talleres.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted">
            <Building2 size={36} className="mb-2 text-secondary-200" />
            No se encontraron talleres
          </div>
        ) : (
          t.paginatedTalleres.map((taller) => {
            const inscritos = taller._count?.inscripciones ?? 0;
            const pct = Math.min(100, (inscritos / taller.cupo_maximo) * 100);
            const isFull = pct >= 90;

            return (
              <div key={taller.id} className="bg-card border border-card rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-1 bg-gradient-to-r from-accent-400 to-warning-400" />
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-heading leading-tight">{taller.nombre}</h3>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-accent-50 text-accent-500">{taller.categoria}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-warning-400">${Number(taller.precio_mensual).toLocaleString('es-AR')}</p>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">/ mes</p>
                    </div>
                  </div>

                  {taller.profesor && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-400 to-warning-400 flex items-center justify-center">
                        <User size={12} className="text-white" />
                      </div>
                      <span className="text-sm text-body">{taller.profesor.nombre} {taller.profesor.apellido}</span>
                    </div>
                  )}

                  {taller.tallerDias && taller.tallerDias.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {taller.tallerDias.map((td) => (
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
                        {inscritos}/{taller.cupo_maximo}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-secondary-100 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-danger-500' : 'bg-gradient-to-r from-accent-400 to-success-400'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-1">
                    <button onClick={() => t.openDetalle(taller.id)} className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer" title="Ver detalle">
                      <Eye className="w-4 h-4 text-muted" />
                    </button>
                    <button onClick={() => t.openEdit(taller)} className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer" title="Editar">
                      <Pencil className="w-4 h-4 text-muted" />
                    </button>
                    <button onClick={() => t.openInscribir(taller.id)} className="p-1.5 rounded-lg hover:bg-success-50 transition-colors cursor-pointer" title="Inscribir alumno">
                      <UserPlus className="w-4 h-4 text-success-500" />
                    </button>
                    <button onClick={() => t.handleDesactivar(taller.id)} className="p-1.5 rounded-lg hover:bg-danger-50 transition-colors cursor-pointer ml-auto" title="Desactivar">
                      <Trash2 className="w-4 h-4 text-danger-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="bg-card border border-card rounded-xl overflow-hidden mt-3">
        <TablePagination
          currentPage={t.page}
          totalItems={t.talleres.length}
          pageSize={t.pageSize}
          onPageChange={t.setPage}
          onPageSizeChange={t.setPageSize}
        />
      </div>

      {/* Modals */}
      {t.showModal && (
        <TallerFormModal
          editing={t.editing}
          form={t.form}
          setForm={t.setForm}
          diasForm={t.diasForm}
          dias={t.dias}
          profesores={t.profesores}
          fieldErrors={t.fieldErrors}
          setFieldErrors={t.setFieldErrors}
          savingLoad={t.savingLoad}
          onClose={() => t.setShowModal(false)}
          onSubmit={t.handleSubmit}
          onAddDia={t.addDia}
          onRemoveDia={t.removeDia}
          onUpdateDia={t.updateDia}
        />
      )}

      {t.showDetalle && t.detalleTaller && (
        <TallerDetalleModal
          taller={t.detalleTaller}
          onClose={() => t.setShowDetalle(false)}
          onInscribir={t.openInscribir}
          onDesinscribir={t.handleDesinscribir}
        />
      )}

      {t.showInscribir && (
        <InscribirAlumnoModal
          alumnos={t.alumnos}
          alumnoSearch={t.alumnoSearch}
          setAlumnoSearch={t.setAlumnoSearch}
          onClose={() => t.setShowInscribir(false)}
          onInscribir={t.handleInscribir}
          fetchAlumnos={t.fetchAlumnos}
        />
      )}
    </div>
  );
}
