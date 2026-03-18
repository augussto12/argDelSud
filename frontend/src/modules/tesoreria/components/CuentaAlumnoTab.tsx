import { Search, User } from 'lucide-react';
import type { CuentaAlumno, AlumnoSearch } from '../types';
import { MESES, fmtMoney, estadoBadge } from '../types';

interface Props {
  searchAlumno: string;
  setSearchAlumno: (v: string) => void;
  alumnosResults: AlumnoSearch[];
  cuentaData: CuentaAlumno | null;
  selectedAlumnoId: number | null;
  onSelectAlumno: (id: number) => void;
  onClearAlumno: () => void;
}

export default function CuentaAlumnoTab({
  searchAlumno, setSearchAlumno,
  alumnosResults,
  cuentaData,
  selectedAlumnoId,
  onSelectAlumno, onClearAlumno,
}: Props) {
  return (
    <>
      {/* Buscador */}
      <div className="bg-card border border-card rounded-xl p-4 mb-6">
        <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Buscar Alumno</label>
        {selectedAlumnoId && cuentaData ? (
          <div className="flex items-center gap-2 py-2.5 px-3 rounded-lg border border-accent-300 bg-accent-50 text-accent-700 text-sm font-semibold">
            <User className="w-4 h-4" />
            <span className="flex-1">
              {cuentaData.alumno.apellido}, {cuentaData.alumno.nombre} — DNI: {cuentaData.alumno.dni}
            </span>
            <button type="button" onClick={onClearAlumno}
              className="text-accent-500 hover:text-accent-700 font-bold cursor-pointer text-lg leading-none">&times;</button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="text" value={searchAlumno} onChange={e => setSearchAlumno(e.target.value)}
                placeholder="Buscar por nombre, apellido o DNI..."
                className="w-full py-2.5 pl-10 pr-3 rounded-lg border border-card bg-card text-body text-sm font-medium" />
            </div>
            {alumnosResults.length > 0 && (
              <div className="mt-2 rounded-lg border border-card" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {alumnosResults.map(a => (
                  <div key={a.id} onClick={() => onSelectAlumno(a.id)}
                    style={{ cursor: 'pointer' }}
                    className="px-3 py-2.5 text-sm border-b border-card last:border-b-0 hover:bg-accent-50 hover:text-accent-700 text-body">
                    {a.apellido}, {a.nombre} — DNI: {a.dni}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {cuentaData && (
        <>
          {/* Resumen cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-card rounded-xl p-4 text-center">
              <p className="text-xs text-muted font-semibold uppercase mb-1">Total Adeudado</p>
              <p className="text-xl font-bold text-danger-600">{fmtMoney(cuentaData.resumen.totalAdeudado)}</p>
            </div>
            <div className="bg-card border border-card rounded-xl p-4 text-center">
              <p className="text-xs text-muted font-semibold uppercase mb-1">Total Pagado</p>
              <p className="text-xl font-bold text-success-600">{fmtMoney(cuentaData.resumen.totalPagado)}</p>
            </div>
            <div className="bg-card border border-card rounded-xl p-4 text-center">
              <p className="text-xs text-muted font-semibold uppercase mb-1">Cuotas Pendientes</p>
              <p className="text-xl font-bold text-warning-600">{cuentaData.resumen.cuotasPendientes}</p>
            </div>
            <div className="bg-card border border-card rounded-xl p-4 text-center">
              <p className="text-xs text-muted font-semibold uppercase mb-1">Cuotas Pagadas</p>
              <p className="text-xl font-bold text-heading">{cuentaData.resumen.cuotasPagadas}</p>
            </div>
          </div>

          {/* Tabla historial */}
          <div className="bg-card border border-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-card bg-surface">
                    <th className="text-left px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Período</th>
                    <th className="text-left px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Taller</th>
                    <th className="text-right px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Original</th>
                    <th className="text-right px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Desc.</th>
                    <th className="text-right px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Final</th>
                    <th className="text-right px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Abonado</th>
                    <th className="text-right px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Saldo</th>
                    <th className="text-center px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentaData.cuotas.map(c => (
                    <tr key={c.id} className="border-b border-card hover-row transition-colors">
                      <td className="px-4 py-3 font-medium text-heading">{MESES[c.mes]} {c.anio}</td>
                      <td className="px-4 py-3 text-body">{c.taller.nombre}</td>
                      <td className="px-4 py-3 text-right text-body">{fmtMoney(c.monto_original)}</td>
                      <td className="px-4 py-3 text-right">
                        {parseFloat(c.descuento_aplicado) > 0
                          ? <span className="text-success-600 font-medium">-{fmtMoney(c.descuento_aplicado)}</span>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-heading">{fmtMoney(c.monto_final)}</td>
                      <td className="px-4 py-3 text-right">
                        {parseFloat(c.abonado) > 0
                          ? <span className="text-success-600 font-medium">{fmtMoney(c.abonado)}</span>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.estado === 'pendiente' && parseFloat(c.saldo) > 0
                          ? <span className="text-danger-600 font-bold">{fmtMoney(c.saldo)}</span>
                          : <span className="text-success-600">$0</span>}
                      </td>
                      <td className="px-4 py-3 text-center">{estadoBadge(c.estado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!cuentaData && !selectedAlumnoId && (
        <div className="text-center py-16">
          <User className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
          <p className="text-muted font-medium">Buscá un alumno para ver su cuenta corriente</p>
        </div>
      )}
    </>
  );
}
