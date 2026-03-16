import { useState, useEffect } from 'react';
import {
  Users, GraduationCap, Building2, ClipboardCheck,
  TrendingUp, Calendar, DollarSign, Percent
} from 'lucide-react';
import api from '../../shared/api/client';

interface Stats {
  alumnos_activos: number;
  profesores: number;
  talleres_activos: number;
  asistencia_hoy: number;
}

interface RecaudacionData {
  recaudacion: Record<string, any>[];
  talleres: string[];
  cobrabilidad: number;
  cuotas_total: number;
  cuotas_pagadas: number;
}

interface CalendarioEntry {
  taller_id: number;
  nombre: string;
  categoria: string;
  profesor: string;
  hora_inicio: string;
  hora_fin: string;
  inscriptos: number;
  cupo_maximo: number;
}

const CATEGORIA_COLORS: Record<string, string> = {
  Deportes: 'bg-accent-100 text-accent-700 border-accent-200',
  Arte: 'bg-warning-100 text-warning-700 border-warning-200',
  Música: 'bg-success-100 text-success-700 border-success-200',
  Educación: 'bg-primary-100 text-primary-400 border-primary-200',
};

const DEFAULT_CAT_COLOR = 'bg-secondary-100 text-secondary-600 border-secondary-200';

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recaudacion, setRecaudacion] = useState<RecaudacionData | null>(null);
  const [calendario, setCalendario] = useState<Record<string, CalendarioEntry[]>>({});

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data.data)).catch(() => {});
    api.get('/dashboard/recaudacion').then(r => setRecaudacion(r.data.data)).catch(() => {});
    api.get('/dashboard/calendario').then(r => setCalendario(r.data.data || {})).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Alumnos Activos', value: stats?.alumnos_activos ?? '—', icon: Users, color: 'bg-accent-50 text-accent-500' },
    { label: 'Profesores', value: stats?.profesores ?? '—', icon: GraduationCap, color: 'bg-warning-50 text-warning-500' },
    { label: 'Talleres Activos', value: stats?.talleres_activos ?? '—', icon: Building2, color: 'bg-success-50 text-success-500' },
    { label: 'Asistencia Hoy', value: stats?.asistencia_hoy ?? '—', icon: ClipboardCheck, color: 'bg-primary-50 text-primary-400' },
  ];

  // Find max total for bar chart scaling
  const maxTotal = recaudacion?.recaudacion
    ? Math.max(...recaudacion.recaudacion.map(r => r.total), 1)
    : 1;

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className="animate-slideUp space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Vista general del club</p>
      </div>

      {/* ═══ Stat Cards ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card border border-card rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-heading">{stat.value}</p>
                  <p className="text-xs text-muted font-medium">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Recaudación + Cobrabilidad ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card border border-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-accent-50 text-accent-500 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <h3 className="font-semibold text-heading">Recaudación Mensual</h3>
          </div>
          {recaudacion?.recaudacion && recaudacion.recaudacion.length > 0 ? (
            <div className="space-y-3">
              {recaudacion.recaudacion.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted w-20 shrink-0 text-right">{r.periodo}</span>
                  <div className="flex-1 bg-surface rounded-full h-7 overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-accent-400 to-accent-500 rounded-full transition-all duration-700 ease-out flex items-center"
                      style={{ width: `${Math.max((r.total / maxTotal) * 100, 2)}%` }}
                    >
                      {r.total > 0 && (
                        <span className="text-[10px] font-bold text-white px-2 whitespace-nowrap">
                          ${r.total.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {recaudacion.talleres.length > 0 && (
                <div className="mt-4 pt-4 border-t border-card">
                  <p className="text-xs text-muted font-semibold mb-2">Talleres incluidos:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {recaudacion.talleres.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-muted font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">No hay datos de recaudación aún. Generá cuotas y registrá pagos desde Tesorería.</p>
          )}
        </div>

        {/* Cobrabilidad */}
        <div className="bg-card border border-card rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-success-50 text-success-500 flex items-center justify-center">
              <Percent size={18} />
            </div>
            <h3 className="font-semibold text-heading">Cobrabilidad</h3>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" className="text-surface" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.915" fill="none" stroke="currentColor"
                  className={recaudacion && recaudacion.cobrabilidad >= 70 ? 'text-success-500' : recaudacion && recaudacion.cobrabilidad >= 40 ? 'text-warning-500' : 'text-danger-500'}
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${recaudacion?.cobrabilidad ?? 0}, 100`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-heading">
                {recaudacion?.cobrabilidad ?? 0}%
              </span>
            </div>
            <p className="text-xs text-muted text-center">
              {recaudacion?.cuotas_pagadas ?? 0} de {recaudacion?.cuotas_total ?? 0} cuotas pagadas este mes
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Calendario Semanal ═══ */}
      <div className="bg-card border border-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-warning-50 text-warning-500 flex items-center justify-center">
            <Calendar size={18} />
          </div>
          <h3 className="font-semibold text-heading">Calendario Semanal</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {diasSemana.map(dia => (
            <div key={dia} className="bg-surface rounded-xl p-3">
              <h4 className="text-xs font-bold text-heading uppercase tracking-wider mb-2.5 text-center border-b border-card pb-2">{dia}</h4>
              <div className="space-y-2 min-h-[60px]">
                {(calendario[dia] || []).length === 0 ? (
                  <p className="text-[10px] text-muted text-center py-3">Sin talleres</p>
                ) : (
                  (calendario[dia] || []).map((entry, i) => (
                    <div key={i} className={`rounded-lg border p-2 text-[11px] ${CATEGORIA_COLORS[entry.categoria] || DEFAULT_CAT_COLOR}`}>
                      <p className="font-bold leading-tight">{entry.nombre}</p>
                      <p className="opacity-70 mt-0.5">{entry.hora_inicio} - {entry.hora_fin}</p>
                      <p className="opacity-60 mt-0.5 truncate">{entry.profesor}</p>
                      <p className="opacity-50 mt-0.5">{entry.inscriptos}/{entry.cupo_maximo}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
