import { ChevronDown, AlertTriangle, Eye } from 'lucide-react';
import TableLoader from '../../../shared/components/TableLoader';
import TablePagination from '../../../shared/components/TablePagination';
import type { Deudor, TallerOption } from '../types';
import { fmtMoney } from '../types';

interface Props {
  deudores: Deudor[];
  paginatedDeudores: Deudor[];
  talleres: TallerOption[];
  filtroTallerDeudores: string;
  setFiltroTallerDeudores: (v: string) => void;
  loadingDeudores: boolean;
  page: number;
  setPage: (v: number) => void;
  pageSize: number;
  setPageSize: (v: number) => void;
  onViewCuenta: (alumnoId: number) => void;
}

export default function DeudoresTab({
  deudores, paginatedDeudores, talleres,
  filtroTallerDeudores, setFiltroTallerDeudores,
  loadingDeudores,
  page, setPage, pageSize, setPageSize,
  onViewCuenta,
}: Props) {
  return (
    <>
      <div className="bg-card border border-card rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1 sm:min-w-[150px]">
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Filtrar por Taller</label>
          <div className="relative">
            <select value={filtroTallerDeudores} onChange={e => setFiltroTallerDeudores(e.target.value)}
              className="w-full py-2.5 pl-3 pr-8 rounded-lg border border-card bg-card text-body text-sm font-medium appearance-none cursor-pointer">
              <option value="">Todos</option>
              {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-card border border-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card bg-surface-alt">
                <th className="text-left px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Alumno</th>
                <th className="text-left px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Talleres</th>
                <th className="text-center px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Meses Atraso</th>
                <th className="text-center px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Cuotas Pend.</th>
                <th className="text-right px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Deuda Total</th>
                <th className="text-center px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Último Pago</th>
                <th className="text-center px-4 py-3 font-semibold text-muted uppercase tracking-wider text-xs">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {loadingDeudores ? (
                <TableLoader colSpan={7} text="Cargando deudores..." />
              ) : deudores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <AlertTriangle className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-muted font-medium">No hay deudores 🎉</p>
                  </td>
                </tr>
              ) : (
                paginatedDeudores.map(d => (
                  <tr key={d.alumno.id} className="border-b border-card hover-row transition-colors">
                    <td className="px-4 py-3 font-medium text-heading">
                      {d.alumno.apellido}, {d.alumno.nombre}
                      <span className="block text-xs text-muted">DNI: {d.alumno.dni}</span>
                    </td>
                    <td className="px-4 py-3 text-body text-sm">
                      {d.talleres.join(', ')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${d.mesesAtraso >= 3 ? 'bg-danger-100 text-danger-700' :
                          d.mesesAtraso >= 2 ? 'bg-warning-100 text-warning-700' :
                            'bg-secondary-100 text-secondary-700'
                        }`}>
                        {d.mesesAtraso} {d.mesesAtraso === 1 ? 'mes' : 'meses'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-body">{d.cuotasPendientes}</td>
                    <td className="px-4 py-3 text-right font-bold text-danger-600">{fmtMoney(d.deudaTotal)}</td>
                    <td className="px-4 py-3 text-center text-sm text-muted">
                      {d.ultimoPago ? new Date(d.ultimoPago).toLocaleDateString('es-AR') : 'Nunca'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => onViewCuenta(d.alumno.id)}
                        className="tap-target rounded-lg hover:bg-surface transition-colors cursor-pointer" title="Ver cuenta">
                        <Eye className="w-4 h-4 text-accent-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={page}
          totalItems={deudores.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </>
  );
}
