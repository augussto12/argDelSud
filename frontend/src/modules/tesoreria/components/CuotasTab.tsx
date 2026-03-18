import { DollarSign, ChevronDown, Zap, Eye, CreditCard, Ban } from 'lucide-react';
import TableLoader from '../../../shared/components/TableLoader';
import TablePagination from '../../../shared/components/TablePagination';
import type { Cuota, TallerOption } from '../types';
import { MESES, fmtMoney, estadoBadge } from '../types';

interface Props {
  cuotas: Cuota[];
  paginatedCuotas: Cuota[];
  talleres: TallerOption[];
  filtroTaller: string;
  setFiltroTaller: (v: string) => void;
  filtroMes: number;
  setFiltroMes: (v: number) => void;
  filtroAnio: number;
  setFiltroAnio: (v: number) => void;
  filtroEstado: string;
  setFiltroEstado: (v: string) => void;
  loadingCuotas: boolean;
  loadingAction: boolean;
  page: number;
  setPage: (v: number) => void;
  pageSize: number;
  setPageSize: (v: number) => void;
  onGenerarMasivo: () => void;
  onOpenPago: (cuota: Cuota) => void;
  onOpenDetalle: (cuota: Cuota) => void;
  onAnular: (id: number) => void;
}

export default function CuotasTab({
  cuotas, paginatedCuotas, talleres,
  filtroTaller, setFiltroTaller,
  filtroMes, setFiltroMes,
  filtroAnio, setFiltroAnio,
  filtroEstado, setFiltroEstado,
  loadingCuotas, loadingAction,
  page, setPage, pageSize, setPageSize,
  onGenerarMasivo, onOpenPago, onOpenDetalle, onAnular,
}: Props) {
  return (
    <>
      {/* Filtros + botón generar */}
      <div className="bg-card border border-card rounded-xl p-4 mb-6 grid grid-cols-2 sm:flex sm:flex-row gap-3 items-end">
        <div className="col-span-2 sm:flex-1 sm:min-w-[150px]">
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Taller</label>
          <div className="relative">
            <select value={filtroTaller} onChange={e => setFiltroTaller(e.target.value)}
              className="w-full py-2.5 pl-3 pr-8 rounded-lg border border-card bg-card text-body text-sm font-medium appearance-none cursor-pointer">
              <option value="">Todos</option>
              {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>
        </div>
        <div className="col-span-1 sm:w-28">
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Mes</label>
          <div className="relative">
            <select value={filtroMes} onChange={e => setFiltroMes(parseInt(e.target.value))}
              className="w-full py-2.5 pl-3 pr-8 rounded-lg border border-card bg-card text-body text-sm font-medium appearance-none cursor-pointer">
              {MESES.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>
        </div>
        <div className="col-span-1 sm:w-24">
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Año</label>
          <input type="number" value={filtroAnio} onChange={e => setFiltroAnio(parseInt(e.target.value))}
            className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium" />
        </div>
        <div className="col-span-1 sm:w-32">
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Estado</label>
          <div className="relative">
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
              className="w-full py-2.5 pl-3 pr-8 rounded-lg border border-card bg-card text-body text-sm font-medium appearance-none cursor-pointer">
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="anulada">Anulada</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>
        </div>
        <button onClick={onGenerarMasivo} disabled={loadingAction}
          className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-400 hover:from-accent-600 hover:to-accent-500 text-white font-semibold rounded-xl shadow-lg shadow-accent-500/20 transition-all hover:-translate-y-0.5 cursor-pointer text-sm whitespace-nowrap disabled:opacity-50">
          <Zap className="w-4 h-4" />
          {loadingAction ? 'Generando...' : 'Generar Cuotas del Mes'}
        </button>
      </div>

      {/* Tabla cuotas */}
      <div className="bg-card border border-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card bg-surface-alt">
                <th className="text-left px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Alumno</th>
                <th className="text-left px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Taller</th>
                <th className="text-right px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Original</th>
                <th className="text-right px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Descuento</th>
                <th className="text-right px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Final</th>
                <th className="text-right px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Abonado</th>
                <th className="text-right px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Saldo</th>
                <th className="text-center px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Estado</th>
                <th className="text-right px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loadingCuotas ? (
                <TableLoader colSpan={9} text="Cargando cuotas..." />
              ) : cuotas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <DollarSign className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-muted font-medium">No se encontraron cuotas</p>
                    <p className="text-muted text-xs mt-1">Usá "Generar Cuotas del Mes" para crear las cuotas</p>
                  </td>
                </tr>
              ) : (
                paginatedCuotas.map(c => {
                  const totalAbonado = c.pagos.reduce((s, p) => s + parseFloat(p.monto_abonado), 0);
                  const saldo = parseFloat(c.monto_final) - totalAbonado;
                  return (
                    <tr key={c.id} className="border-b border-card hover-row transition-colors">
                      <td className="px-4 py-3 font-medium text-heading">
                        {c.inscripcion.alumno.apellido}, {c.inscripcion.alumno.nombre}
                        <span className="block text-xs text-muted">DNI: {c.inscripcion.alumno.dni}</span>
                      </td>
                      <td className="px-4 py-3 text-body">{c.inscripcion.taller.nombre}</td>
                      <td className="px-4 py-3 text-right text-body">{fmtMoney(c.monto_original)}</td>
                      <td className="px-4 py-3 text-right">
                        {parseFloat(c.descuento_aplicado) > 0
                          ? <span className="text-success-600 font-medium">-{fmtMoney(c.descuento_aplicado)}</span>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-heading">{fmtMoney(c.monto_final)}</td>
                      <td className="px-4 py-3 text-right">
                        {totalAbonado > 0
                          ? <span className="text-success-600 font-medium">{fmtMoney(totalAbonado)}</span>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.estado === 'pendiente' && saldo > 0
                          ? <span className="text-danger-600 font-bold">{fmtMoney(saldo)}</span>
                          : <span className="text-success-600 font-medium">$0</span>}
                      </td>
                      <td className="px-4 py-3 text-center">{estadoBadge(c.estado)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => onOpenDetalle(c)}
                            className="tap-target rounded-lg hover:bg-surface transition-colors cursor-pointer" title="Ver detalle">
                            <Eye className="w-4 h-4 text-muted" />
                          </button>
                          {c.estado === 'pendiente' && (
                            <>
                              <button onClick={() => onOpenPago(c)}
                                className="tap-target rounded-lg hover:bg-success-50 transition-colors cursor-pointer" title="Registrar pago">
                                <CreditCard className="w-4 h-4 text-success-600" />
                              </button>
                              <button onClick={() => onAnular(c.id)}
                                className="tap-target rounded-lg hover:bg-danger-50 transition-colors cursor-pointer" title="Anular">
                                <Ban className="w-4 h-4 text-danger-500" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={page}
          totalItems={cuotas.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </>
  );
}
