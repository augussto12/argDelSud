import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Award, AlertTriangle } from 'lucide-react';
import api from '../../shared/api/client';

interface Resumen {
  recaudadoMesActual: number;
  facturadoMesActual: number;
  cobrabilidadMesActual: number;
  proyeccionMensual: number;
  deudaTotal: number;
  totalBecasDescuento: number;
  alumnosActivos: number;
  inscripcionesActivas: number;
}

interface CashFlowEntry {
  periodo: string;
  facturado: number;
  cobrado: number;
  pendiente: number;
  cobrabilidad: number;
  cuotasTotal: number;
  cuotasPagadas: number;
}

interface TallerRanking {
  id: number;
  nombre: string;
  precio_mensual: number;
  recaudado: number;
  inscriptos: number;
  cuotasPendientes: number;
  proyeccion_mensual: number;
}

const fmtMoney = (v: number) => `$${v.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function MetricasPage() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([]);
  const [rankingTalleres, setRankingTalleres] = useState<TallerRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/metricas', { params: { meses: 12 } });
        setResumen(data.data.resumen);
        setCashFlow(data.data.cashFlow);
        setRankingTalleres(data.data.rankingTalleres);
      } catch { /* empty */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="animate-fadeIn flex items-center justify-center py-32">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-secondary-300 mx-auto mb-3 animate-pulse" />
          <p className="text-muted font-medium">Calculando métricas...</p>
        </div>
      </div>
    );
  }

  if (!resumen) return null;

  // Calcular max para barras
  const maxCobrado = Math.max(...cashFlow.map(c => c.facturado), 1);

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-heading">Métricas & Cash Flow</h1>
        <p className="text-muted text-sm mt-1">Análisis financiero completo del club</p>
      </div>

      {/* ═══ Cards resumen ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success-600" />
            </div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Recaudado este Mes</p>
          </div>
          <p className="text-2xl font-bold text-success-600">{fmtMoney(resumen.recaudadoMesActual)}</p>
          <p className="text-xs text-muted mt-1">de {fmtMoney(resumen.facturadoMesActual)} facturado</p>
        </div>

        <div className="bg-card border border-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-600" />
            </div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Proyección Mensual</p>
          </div>
          <p className="text-2xl font-bold text-accent-600">{fmtMoney(resumen.proyeccionMensual)}</p>
          <p className="text-xs text-muted mt-1">si todos pagan al 100%</p>
        </div>

        <div className="bg-card border border-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-danger-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-danger-600" />
            </div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Deuda Total</p>
          </div>
          <p className="text-2xl font-bold text-danger-600">{fmtMoney(resumen.deudaTotal)}</p>
          <p className="text-xs text-muted mt-1">acumulado pendiente</p>
        </div>

        <div className="bg-card border border-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-warning-600" />
            </div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Cobrabilidad</p>
          </div>
          <p className="text-2xl font-bold text-heading">{resumen.cobrabilidadMesActual}%</p>
          <div className="mt-2 w-full bg-secondary-200 rounded-full h-2">
            <div className="h-2 rounded-full transition-all duration-500" style={{
              width: `${resumen.cobrabilidadMesActual}%`,
              backgroundColor: resumen.cobrabilidadMesActual >= 80 ? 'var(--color-success-500)' :
                               resumen.cobrabilidadMesActual >= 50 ? 'var(--color-warning-500)' : 'var(--color-danger-500)',
            }} />
          </div>
        </div>
      </div>

      {/* ═══ Cards secundarias ═══ */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-card rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Alumnos / Inscripciones</p>
            <p className="text-lg font-bold text-heading">{resumen.alumnosActivos} <span className="text-sm text-muted font-normal">/ {resumen.inscripcionesActivas} insc.</span></p>
          </div>
        </div>
        <div className="bg-card border border-card rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-accent-600" />
          </div>
          <div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Becas otorgadas</p>
            <p className="text-lg font-bold text-heading">{fmtMoney(resumen.totalBecasDescuento)} <span className="text-sm text-muted font-normal">en descuentos</span></p>
          </div>
        </div>
        <div className="bg-card border border-card rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-danger-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-danger-600" />
          </div>
          <div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Talleres activos</p>
            <p className="text-lg font-bold text-heading">{rankingTalleres.length}</p>
          </div>
        </div>
      </div>

      {/* ═══ Cash Flow chart (CSS bars) ═══ */}
      <div className="bg-card border border-card rounded-xl p-6 mb-8">
        <h2 className="text-lg font-bold text-heading mb-1">Cash Flow — Últimos 12 Meses</h2>
        <p className="text-xs text-muted mb-6">Facturado vs Cobrado por mes</p>

        <div className="flex items-end gap-2" style={{ height: '240px' }}>
          {cashFlow.map((entry, i) => {
            const facturadoPct = maxCobrado > 0 ? (entry.facturado / maxCobrado) * 100 : 0;
            const cobradoPct = maxCobrado > 0 ? (entry.cobrado / maxCobrado) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative" style={{ height: '100%' }}>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-heading text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                  <p className="font-bold mb-1">{entry.periodo}</p>
                  <p>Facturado: {fmtMoney(entry.facturado)}</p>
                  <p>Cobrado: {fmtMoney(entry.cobrado)}</p>
                  <p>Cobrabilidad: {entry.cobrabilidad}%</p>
                </div>

                {/* Bars container */}
                <div className="w-full flex-1 flex items-end justify-center gap-0.5">
                  {/* Facturado bar */}
                  <div className="w-[45%] rounded-t-md bg-secondary-200 transition-all duration-500"
                    style={{ height: `${Math.max(facturadoPct, 2)}%` }} />
                  {/* Cobrado bar */}
                  <div className="w-[45%] rounded-t-md bg-success-400 transition-all duration-500"
                    style={{ height: `${Math.max(cobradoPct, 2)}%` }} />
                </div>

                {/* Label */}
                <span className="text-[10px] text-muted font-medium whitespace-nowrap">{entry.periodo.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-secondary-200" />
            <span className="text-xs text-muted font-medium">Facturado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-success-400" />
            <span className="text-xs text-muted font-medium">Cobrado</span>
          </div>
        </div>
      </div>

      {/* ═══ Ranking talleres ═══ */}
      <div className="bg-card border border-card rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-card">
          <h2 className="text-lg font-bold text-heading">Ranking de Talleres por Recaudación</h2>
          <p className="text-xs text-muted mt-0.5">Ordenado de mayor a menor ingreso total</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card bg-surface">
                <th className="text-center px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs w-12">#</th>
                <th className="text-left px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Taller</th>
                <th className="text-right px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Precio</th>
                <th className="text-center px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Inscr.</th>
                <th className="text-right px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Recaudado Total</th>
                <th className="text-right px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Proyección/Mes</th>
                <th className="text-center px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Cuotas Pend.</th>
                <th className="text-left px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs" style={{ minWidth: '200px' }}>% del Total</th>
              </tr>
            </thead>
            <tbody>
              {rankingTalleres.map((t, i) => {
                const totalRecaudado = rankingTalleres.reduce((s, x) => s + x.recaudado, 0);
                const pct = totalRecaudado > 0 ? (t.recaudado / totalRecaudado) * 100 : 0;
                return (
                  <tr key={t.id} className="border-b border-card hover-row transition-colors">
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                        i === 0 ? 'bg-warning-100 text-warning-700' :
                        i === 1 ? 'bg-secondary-200 text-secondary-600' :
                        i === 2 ? 'bg-amber-100 text-amber-700' :
                        'bg-surface text-muted'
                      }`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-heading">{t.nombre}</td>
                    <td className="px-4 py-3 text-right text-body">{fmtMoney(t.precio_mensual)}</td>
                    <td className="px-4 py-3 text-center font-medium text-body">{t.inscriptos}</td>
                    <td className="px-4 py-3 text-right font-bold text-success-600">{fmtMoney(t.recaudado)}</td>
                    <td className="px-4 py-3 text-right text-accent-600 font-medium">{fmtMoney(t.proyeccion_mensual)}</td>
                    <td className="px-4 py-3 text-center">
                      {t.cuotasPendientes > 0
                        ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-warning-100 text-warning-700">{t.cuotasPendientes}</span>
                        : <span className="text-success-500 text-xs font-medium">0</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-accent-400 transition-all duration-700"
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted font-medium w-10 text-right">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rankingTalleres.length > 0 && (
                <tr className="bg-surface font-bold">
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-heading">TOTAL</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-center text-heading">{rankingTalleres.reduce((s, t) => s + t.inscriptos, 0)}</td>
                  <td className="px-4 py-3 text-right text-success-600">{fmtMoney(rankingTalleres.reduce((s, t) => s + t.recaudado, 0))}</td>
                  <td className="px-4 py-3 text-right text-accent-600">{fmtMoney(rankingTalleres.reduce((s, t) => s + t.proyeccion_mensual, 0))}</td>
                  <td className="px-4 py-3 text-center text-heading">{rankingTalleres.reduce((s, t) => s + t.cuotasPendientes, 0)}</td>
                  <td className="px-4 py-3" />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
