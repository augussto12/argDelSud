import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Search, CreditCard, Ban, ChevronDown,
  Banknote, ArrowRightLeft, Landmark, Eye, AlertTriangle,
  User, Zap
} from 'lucide-react';
import api from '../../shared/api/client';
import PageLoader from '../../shared/components/PageLoader';
import TableLoader from '../../shared/components/TableLoader';
import { useToastStore } from '../../shared/hooks/useToastStore';

interface CuotaPago {
  id: number;
  monto_abonado: string;
  metodo_pago: string;
  creado_at: string;
}

interface Cuota {
  id: number;
  mes: number;
  anio: number;
  monto_original: string;
  descuento_aplicado: string;
  monto_final: string;
  estado: string;
  inscripcion: {
    alumno: { id: number; nombre: string; apellido: string; dni: string };
    taller: { id: number; nombre: string };
  };
  pagos: CuotaPago[];
}

interface Taller {
  id: number;
  nombre: string;
}

interface Deudor {
  alumno: { id: number; nombre: string; apellido: string; dni: string };
  talleres: string[];
  mesesAtraso: number;
  deudaTotal: string;
  cuotasPendientes: number;
  ultimoPago: string | null;
  cuotas: { id: number; mes: number; anio: number; monto_final: string; abonado: string; saldo: string; taller: string }[];
}

interface CuentaCuota {
  id: number;
  mes: number;
  anio: number;
  taller: { id: number; nombre: string };
  monto_original: string;
  descuento_aplicado: string;
  monto_final: string;
  abonado: string;
  saldo: string;
  estado: string;
  pagos: CuotaPago[];
}

interface CuentaAlumno {
  alumno: { id: number; nombre: string; apellido: string; dni: string };
  resumen: {
    totalAdeudado: string;
    totalPagado: string;
    cuotasPendientes: number;
    cuotasPagadas: number;
    totalCuotas: number;
  };
  cuotas: CuentaCuota[];
}

interface AlumnoSearch {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
}

const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const METODO_ICONS: Record<string, typeof Banknote> = {
  efectivo: Banknote,
  transferencia: ArrowRightLeft,
  debito: Landmark,
};

type Tab = 'cuotas' | 'deudores' | 'cuenta';

export default function TesoreriaPage() {
  const [activeTab, setActiveTab] = useState<Tab>('cuotas');

  // ─── Tab Cuotas state ───
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [filtroTaller, setFiltroTaller] = useState('');
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState<Cuota | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [pagoForm, setPagoForm] = useState({ monto_abonado: '', metodo_pago: 'efectivo', observaciones: '' });

  // ─── Tab Deudores state ───
  const [deudores, setDeudores] = useState<Deudor[]>([]);
  const [filtroTallerDeudores, setFiltroTallerDeudores] = useState('');

  // ─── Tab Cuenta Alumno state ───
  const [searchAlumno, setSearchAlumno] = useState('');
  const [alumnosResults, setAlumnosResults] = useState<AlumnoSearch[]>([]);
  const [cuentaData, setCuentaData] = useState<CuentaAlumno | null>(null);
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<number | null>(null);

  // ─── Global ───
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingCuotas, setLoadingCuotas] = useState(false);
  const [loadingDeudores, setLoadingDeudores] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // ─── Fetch talleres (once) ───
  useEffect(() => {
    api.get('/talleres?activo=true').then(r => setTalleres(r.data.data || [])).catch(() => { });
  }, []);

  // ─── Fetch cuotas ───
  const fetchCuotas = useCallback(async () => {
    setLoadingCuotas(true);
    try {
      const params: any = {};
      if (filtroTaller) params.taller_id = filtroTaller;
      if (filtroMes) params.mes = filtroMes;
      if (filtroAnio) params.anio = filtroAnio;
      if (filtroEstado) params.estado = filtroEstado;
      const { data } = await api.get('/cuotas', { params });
      setCuotas(data.data || []);
    } catch { setCuotas([]); }
    finally { setLoadingPage(false); setLoadingCuotas(false); }
  }, [filtroTaller, filtroMes, filtroAnio, filtroEstado]);

  useEffect(() => { if (activeTab === 'cuotas') fetchCuotas(); }, [fetchCuotas, activeTab]);

  // ─── Fetch deudores ───
  const fetchDeudores = useCallback(async () => {
    setLoadingDeudores(true);
    try {
      const params: any = {};
      if (filtroTallerDeudores) params.taller_id = filtroTallerDeudores;
      const { data } = await api.get('/cuotas/deudores', { params });
      setDeudores(data.data || []);
    } catch { setDeudores([]); }
    finally { setLoadingDeudores(false); }
  }, [filtroTallerDeudores]);

  useEffect(() => { if (activeTab === 'deudores') fetchDeudores(); }, [fetchDeudores, activeTab]);

  // ─── Search alumnos ───
  useEffect(() => {
    if (!searchAlumno || searchAlumno.length < 2) { setAlumnosResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/alumnos', { params: { search: searchAlumno, activo: true } });
        setAlumnosResults((data.data || []).slice(0, 10));
      } catch { setAlumnosResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchAlumno]);

  // ─── Fetch cuenta alumno ───
  const fetchCuenta = useCallback(async (alumnoId: number) => {
    try {
      const { data } = await api.get(`/cuotas/cuenta/${alumnoId}`);
      setCuentaData(data.data);
    } catch { setCuentaData(null); }
  }, []);

  useEffect(() => { if (selectedAlumnoId) fetchCuenta(selectedAlumnoId); }, [selectedAlumnoId, fetchCuenta]);

  // ─── Actions ───
  const handleGenerarMasivo = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/cuotas/generar-masivo', {
        mes: filtroMes,
        anio: filtroAnio,
      });
      useToastStore.getState().success(data.message || 'Cuotas generadas exitosamente');
      fetchCuotas();
    } catch (err: any) {
      useToastStore.getState().error(err.response?.data?.message || 'Error al generar cuotas');
    } finally { setLoading(false); }
  };

  const handleRegistrarPago = async () => {
    if (!selectedCuota) return;
    const monto = parseFloat(pagoForm.monto_abonado);
    if (!pagoForm.monto_abonado || isNaN(monto) || monto <= 0) {
      useToastStore.getState().error('Ingresá un monto válido mayor a 0');
      return;
    }
    setLoading(true);
    try {
      await api.post('/cuotas/pagos', {
        cuota_id: selectedCuota.id,
        monto_abonado: monto,
        metodo_pago: pagoForm.metodo_pago,
        observaciones: pagoForm.observaciones || null,
      });
      useToastStore.getState().success('Pago registrado correctamente');
      setShowPagoModal(false);
      setPagoForm({ monto_abonado: '', metodo_pago: 'efectivo', observaciones: '' });
      fetchCuotas();
      if (selectedAlumnoId) fetchCuenta(selectedAlumnoId);
    } catch (err: any) {
      useToastStore.getState().error(err.response?.data?.message || 'Error al registrar pago');
    } finally { setLoading(false); }
  };

  const handleAnularCuota = async (id: number) => {
    if (!confirm('¿Seguro que querés anular esta cuota?')) return;
    try {
      await api.patch(`/cuotas/${id}/anular`);
      useToastStore.getState().success('Cuota anulada');
      fetchCuotas();
    } catch (err: any) {
      useToastStore.getState().error(err.response?.data?.message || 'Error al anular cuota');
    }
  };

  const openPago = (cuota: Cuota) => {
    const totalAbonado = cuota.pagos.reduce((s, p) => s + parseFloat(p.monto_abonado), 0);
    const saldo = parseFloat(cuota.monto_final) - totalAbonado;
    setSelectedCuota(cuota);
    setPagoForm({ monto_abonado: saldo.toFixed(2), metodo_pago: 'efectivo', observaciones: '' });
    setShowPagoModal(true);
  };

  const estadoBadge = (estado: string) => {
    const styles: Record<string, string> = {
      pendiente: 'bg-warning-100 text-warning-700',
      pagada: 'bg-success-100 text-success-700',
      anulada: 'bg-danger-100 text-danger-700',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[estado] || 'bg-secondary-100 text-secondary-700'}`}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  const tabs: { key: Tab; label: string; icon: typeof DollarSign }[] = [
    { key: 'cuotas', label: 'Cuotas del Mes', icon: DollarSign },
    { key: 'deudores', label: 'Deudores', icon: AlertTriangle },
    { key: 'cuenta', label: 'Cuenta Alumno', icon: User },
  ];

  const fmtMoney = (v: string | number) => `$${parseFloat(String(v)).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  if (loadingPage) return <PageLoader text="Cargando tesorería..." />;

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Tesorería</h1>
          <p className="text-muted text-sm mt-1">Gestión de cuotas, pagos y deudas</p>
        </div>
      </div>

      {/* Mensaje flash */}
      {mensaje && (
        <div className="mb-4 p-3 rounded-xl bg-card border border-card text-sm font-medium text-body animate-slideUp cursor-pointer" onClick={() => setMensaje('')}>
          {mensaje}
        </div>
      )}

      {/* ═══ Tabs ═══ */}
      <div className="flex gap-1 bg-card border border-card rounded-xl p-1 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${activeTab === t.key
                ? 'bg-accent-500 text-white shadow-md shadow-accent-500/20'
                : 'text-muted hover:text-body hover:bg-surface'
              }`}>
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════ TAB 1: CUOTAS DEL MES ═══════════════ */}
      {activeTab === 'cuotas' && (
        <>
          {/* Filtros + botón generar */}
          <div className="bg-card border border-card rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 min-w-[150px]">
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
            <div className="w-28">
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Mes</label>
              <div className="relative">
                <select value={filtroMes} onChange={e => setFiltroMes(parseInt(e.target.value))}
                  className="w-full py-2.5 pl-3 pr-8 rounded-lg border border-card bg-card text-body text-sm font-medium appearance-none cursor-pointer">
                  {MESES.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              </div>
            </div>
            <div className="w-24">
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Año</label>
              <input type="number" value={filtroAnio} onChange={e => setFiltroAnio(parseInt(e.target.value))}
                className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium" />
            </div>
            <div className="w-32">
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
            <button onClick={handleGenerarMasivo} disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-400 hover:from-accent-600 hover:to-accent-500 text-white font-semibold rounded-xl shadow-lg shadow-accent-500/20 transition-all hover:-translate-y-0.5 cursor-pointer text-sm whitespace-nowrap disabled:opacity-50">
              <Zap className="w-4 h-4" />
              {loading ? 'Generando...' : 'Generar Cuotas del Mes'}
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
                    cuotas.map(c => {
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
                              <button onClick={() => { setSelectedCuota(c); setShowDetalle(true); }}
                                className="tap-target rounded-lg hover:bg-surface transition-colors cursor-pointer" title="Ver detalle">
                                <Eye className="w-4 h-4 text-muted" />
                              </button>
                              {c.estado === 'pendiente' && (
                                <>
                                  <button onClick={() => openPago(c)}
                                    className="tap-target rounded-lg hover:bg-success-50 transition-colors cursor-pointer" title="Registrar pago">
                                    <CreditCard className="w-4 h-4 text-success-600" />
                                  </button>
                                  <button onClick={() => handleAnularCuota(c.id)}
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
          </div>
        </>
      )}

      {/* ═══════════════ TAB 2: DEUDORES ═══════════════ */}
      {activeTab === 'deudores' && (
        <>
          <div className="bg-card border border-card rounded-xl p-4 mb-6 flex gap-3 items-end">
            <div className="flex-1 min-w-[150px]">
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
                    deudores.map(d => (
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
                          <button onClick={() => { setSelectedAlumnoId(d.alumno.id); setActiveTab('cuenta'); }}
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
          </div>
        </>
      )}

      {/* ═══════════════ TAB 3: CUENTA ALUMNO ═══════════════ */}
      {activeTab === 'cuenta' && (
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
                <button type="button" onClick={() => { setSelectedAlumnoId(null); setCuentaData(null); setSearchAlumno(''); }}
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
                      <div key={a.id} onClick={() => { setSelectedAlumnoId(a.id); setSearchAlumno(''); setAlumnosResults([]); }}
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
      )}

      {/* ═══ Modal: Registrar Pago ═══ */}
      {showPagoModal && selectedCuota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPagoModal(false)} />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slideUp border border-card">
            <h3 className="text-xl font-bold text-heading mb-2">Registrar Pago</h3>
            <p className="text-muted text-sm mb-1">
              {selectedCuota.inscripcion.alumno.apellido}, {selectedCuota.inscripcion.alumno.nombre} — {selectedCuota.inscripcion.taller.nombre}
            </p>
            <p className="text-muted text-xs mb-6">
              {MESES[selectedCuota.mes]} {selectedCuota.anio} • Monto: {fmtMoney(selectedCuota.monto_final)}
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Monto a abonar ($)</label>
                <input type="number" step="0.01" value={pagoForm.monto_abonado} onChange={e => setPagoForm({ ...pagoForm, monto_abonado: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Método de pago</label>
                <div className="flex gap-2">
                  {(['efectivo', 'transferencia', 'debito'] as const).map(m => {
                    const Icon = METODO_ICONS[m];
                    return (
                      <button key={m} type="button" onClick={() => setPagoForm({ ...pagoForm, metodo_pago: m })}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border font-medium text-xs transition-all cursor-pointer ${pagoForm.metodo_pago === m
                            ? 'border-accent-400 bg-accent-50 text-accent-700'
                            : 'border-card bg-card text-muted hover:bg-surface'
                          }`}>
                        <Icon className="w-5 h-5" />
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Observaciones (opcional)</label>
                <textarea value={pagoForm.observaciones} onChange={e => setPagoForm({ ...pagoForm, observaciones: e.target.value })}
                  rows={2} className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowPagoModal(false)} className="flex-1 py-2.5 rounded-xl border border-card text-body font-semibold hover:bg-surface transition-colors cursor-pointer text-sm">
                Cancelar
              </button>
              <button onClick={handleRegistrarPago} disabled={loading || !pagoForm.monto_abonado}
                className="flex-1 py-2.5 rounded-xl bg-success-500 hover:bg-success-600 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer text-sm">
                {loading ? 'Registrando...' : 'Registrar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Modal: Detalle de cuota ═══ */}
      {showDetalle && selectedCuota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDetalle(false)} />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-slideUp border border-card">
            <h3 className="text-xl font-bold text-heading mb-2">Detalle de Cuota</h3>
            <p className="text-muted text-sm mb-6">
              {selectedCuota.inscripcion.alumno.apellido}, {selectedCuota.inscripcion.alumno.nombre} — {MESES[selectedCuota.mes]} {selectedCuota.anio}
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-surface rounded-xl p-4 text-center">
                <p className="text-xs text-muted font-semibold uppercase mb-1">Original</p>
                <p className="text-lg font-bold text-heading">{fmtMoney(selectedCuota.monto_original)}</p>
              </div>
              <div className="bg-surface rounded-xl p-4 text-center">
                <p className="text-xs text-muted font-semibold uppercase mb-1">Descuento</p>
                <p className="text-lg font-bold text-success-600">{fmtMoney(selectedCuota.descuento_aplicado)}</p>
              </div>
              <div className="bg-surface rounded-xl p-4 text-center">
                <p className="text-xs text-muted font-semibold uppercase mb-1">A Pagar</p>
                <p className="text-lg font-bold text-heading">{fmtMoney(selectedCuota.monto_final)}</p>
              </div>
            </div>
            {selectedCuota.pagos.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-heading mb-3">Pagos registrados</h4>
                <div className="space-y-2">
                  {selectedCuota.pagos.map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-surface rounded-lg px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-success-500" />
                        <span className="text-sm font-medium text-heading">{fmtMoney(p.monto_abonado)}</span>
                        <span className="text-xs text-muted">{p.metodo_pago}</span>
                      </div>
                      <span className="text-xs text-muted">{new Date(p.creado_at).toLocaleDateString('es-AR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setShowDetalle(false)} className="w-full mt-6 py-2.5 rounded-xl border border-card text-body font-semibold hover:bg-surface transition-colors cursor-pointer text-sm">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
