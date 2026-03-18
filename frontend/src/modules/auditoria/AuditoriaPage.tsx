import { useState, useEffect, useCallback } from 'react';
import { ScrollText, ChevronDown } from 'lucide-react';
import api from '../../shared/api/client';
import TableLoader from '../../shared/components/TableLoader';
import TablePagination from '../../shared/components/TablePagination';

interface AuditLog {
  id: number;
  accion: string;
  entidad: string;
  entidad_id: number | null;
  detalle: any;
  ip: string | null;
  creado_at: string;
  usuario: { id: number; nombre: string; email: string } | null;
}

const ACCION_STYLES: Record<string, string> = {
  crear: 'bg-success-100 text-success-700',
  editar: 'bg-accent-100 text-accent-700',
  eliminar: 'bg-danger-100 text-danger-700',
  login: 'bg-primary-100 text-primary-700',
  generar_cuotas: 'bg-warning-100 text-warning-700',
  registrar_pago: 'bg-success-100 text-success-700',
  anular: 'bg-danger-100 text-danger-700',
  desactivar: 'bg-secondary-200 text-secondary-700',
};

const ACCION_LABELS: Record<string, string> = {
  crear: 'Crear',
  editar: 'Editar',
  eliminar: 'Eliminar',
  login: 'Login',
  generar_cuotas: 'Generar Cuotas',
  registrar_pago: 'Registrar Pago',
  anular: 'Anular',
  desactivar: 'Desactivar',
};

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filtroEntidad, setFiltroEntidad] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: pageSize };
      if (filtroEntidad) params.entidad = filtroEntidad;
      if (filtroAccion) params.accion = filtroAccion;
      if (filtroDesde) params.desde = filtroDesde;
      if (filtroHasta) params.hasta = filtroHasta;
      const { data } = await api.get('/auditoria', { params });
      setLogs(data.data || []);
      setPagination(data.pagination || { total: 0, pages: 0 });
    } catch { setLogs([]); }
    finally { setLoading(false); }
  }, [page, pageSize, filtroEntidad, filtroAccion, filtroDesde, filtroHasta]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const accionBadge = (accion: string) => {
    const style = ACCION_STYLES[accion] || 'bg-secondary-100 text-secondary-700';
    const label = ACCION_LABELS[accion] || accion;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${style}`}>
        {label}
      </span>
    );
  };

  const formatDetalle = (detalle: any) => {
    if (!detalle) return '—';
    if (typeof detalle === 'string') return detalle;
    const entries = Object.entries(detalle).slice(0, 3);
    return entries.map(([k, v]) => `${k}: ${v}`).join(', ');
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-heading">Auditoría</h1>
        <p className="text-muted text-sm mt-1">Registro de todas las acciones del sistema</p>
      </div>

      {/* Filtros */}
      <div className="bg-card border border-card rounded-xl p-4 mb-6 grid grid-cols-2 sm:flex sm:flex-row gap-3 items-end">
        <div className="col-span-1 sm:w-36">
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Entidad</label>
          <div className="relative">
            <select value={filtroEntidad} onChange={e => { setFiltroEntidad(e.target.value); setPage(1); }}
              className="w-full py-2.5 pl-3 pr-8 rounded-lg border border-card bg-card text-body text-sm font-medium appearance-none cursor-pointer">
              <option value="">Todas</option>
              <option value="alumno">Alumno</option>
              <option value="profesor">Profesor</option>
              <option value="taller">Taller</option>
              <option value="inscripcion">Inscripción</option>
              <option value="cuota">Cuota</option>
              <option value="pago">Pago</option>
              <option value="beca">Beca</option>
              <option value="usuario">Usuario</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>
        </div>
        <div className="col-span-1 sm:w-40">
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Acción</label>
          <div className="relative">
            <select value={filtroAccion} onChange={e => { setFiltroAccion(e.target.value); setPage(1); }}
              className="w-full py-2.5 pl-3 pr-8 rounded-lg border border-card bg-card text-body text-sm font-medium appearance-none cursor-pointer">
              <option value="">Todas</option>
              <option value="crear">Crear</option>
              <option value="editar">Editar</option>
              <option value="eliminar">Eliminar</option>
              <option value="login">Login</option>
              <option value="generar_cuotas">Generar Cuotas</option>
              <option value="registrar_pago">Registrar Pago</option>
              <option value="anular">Anular</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>
        </div>
        <div className="col-span-1 sm:w-36">
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Desde</label>
          <input type="date" value={filtroDesde} onChange={e => { setFiltroDesde(e.target.value); setPage(1); }}
            className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium" />
        </div>
        <div className="col-span-1 sm:w-36">
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Hasta</label>
          <input type="date" value={filtroHasta} onChange={e => { setFiltroHasta(e.target.value); setPage(1); }}
            className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium" />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-card border border-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card bg-surface">
                <th className="text-left px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Fecha / Hora</th>
                <th className="text-left px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Usuario</th>
                <th className="text-center px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Acción</th>
                <th className="text-left px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Entidad</th>
                <th className="text-left px-4 py-3 font-bold text-muted uppercase tracking-wider text-xs">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableLoader colSpan={5} text="Cargando auditoría..." />
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <ScrollText className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-muted font-medium">No hay registros de auditoría</p>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="border-b border-card hover-row transition-colors">
                    <td className="px-4 py-3 text-body text-sm whitespace-nowrap">
                      {new Date(log.creado_at).toLocaleDateString('es-AR')}
                      <span className="block text-xs text-muted">{new Date(log.creado_at).toLocaleTimeString('es-AR')}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-heading">
                      {log.usuario?.nombre || 'Sistema'}
                    </td>
                    <td className="px-4 py-3 text-center">{accionBadge(log.accion)}</td>
                    <td className="px-4 py-3 text-body capitalize">
                      {log.entidad}
                      {log.entidad_id && <span className="text-xs text-muted ml-1">#{log.entidad_id}</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted max-w-xs truncate">
                      {formatDetalle(log.detalle)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={page}
          totalItems={pagination.total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}
