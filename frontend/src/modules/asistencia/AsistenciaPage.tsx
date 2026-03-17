import { useEffect, useState } from 'react';
import api from '../../shared/api/client';
import type { Taller, ApiResponse } from '../../shared/types';
import { Check, X as XIcon, Loader2, ClipboardCheck, ChevronDown } from 'lucide-react';
import { useToastStore } from '../../shared/hooks/useToastStore';

interface AsistenciaEntry {
  alumno: { id: number; nombre: string; apellido: string; dni: string };
  presente: boolean | null;
}

export default function AsistenciaPage() {
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [selectedTaller, setSelectedTaller] = useState<number | null>(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [lista, setLista] = useState<AsistenciaEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get<ApiResponse<Taller[]>>('/talleres', { params: { activo: 'true' } })
      .then(res => setTalleres(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedTaller && fecha) loadLista();
  }, [selectedTaller, fecha]);

  const loadLista = async () => {
    if (!selectedTaller) return;
    setLoading(true);
    try {
      const res = await api.get(`/asistencias/taller/${selectedTaller}`, { params: { fecha } });
      setLista(res.data.data);
    } catch { /* API not running */ }
    finally { setLoading(false); }
  };

  const togglePresente = (alumnoId: number) => {
    setLista(prev => prev.map(item =>
      item.alumno.id === alumnoId ? { ...item, presente: item.presente === true ? false : true } : item
    ));
  };

  const marcarTodos = (presente: boolean) => {
    setLista(prev => prev.map(item => ({ ...item, presente })));
  };

  const guardar = async () => {
    if (!selectedTaller) return;
    setSaving(true); setMessage('');
    try {
      const asistencias = lista.map(item => ({ alumno_id: item.alumno.id, presente: item.presente === true }));
      await api.post('/asistencias', { taller_id: selectedTaller, fecha, asistencias });
      useToastStore.getState().success('Asistencia guardada correctamente');
    } catch { useToastStore.getState().error('Error al guardar asistencia'); }
    finally { setSaving(false); }
  };

  const presentes = lista.filter(i => i.presente === true).length;
  const ausentes = lista.filter(i => i.presente === false).length;

  return (
    <div className="animate-slideUp space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-heading">Pasar Lista</h1>
        <p className="text-sm text-muted mt-0.5">Control de asistencia por taller</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:w-72">
          <select value={selectedTaller ?? ''} onChange={(e) => setSelectedTaller(Number(e.target.value) || null)}
            className="w-full appearance-none px-3.5 py-3 pr-10 rounded-xl border bg-input border-input text-sm text-heading cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-400 transition-colors min-h-[48px]">
            <option value="">Seleccionar taller...</option>
            {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none" />
        </div>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
          className="sm:w-44 px-3.5 py-3 rounded-xl border bg-input border-input text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-400 transition-colors min-h-[48px]" />
      </div>

      {selectedTaller && (
        <div className="bg-card border border-card rounded-xl overflow-hidden">
          {/* Summary bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 bg-surface-alt border-b border-card">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-body font-medium">{lista.length} inscriptos</span>
              {lista.length > 0 && (
                <>
                  <span className="flex items-center gap-1 text-xs font-semibold text-success-500">
                    <span className="w-2 h-2 rounded-full bg-success-500" /> {presentes} presentes
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-danger-500">
                    <span className="w-2 h-2 rounded-full bg-danger-500" /> {ausentes} ausentes
                  </span>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => marcarTodos(true)}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-success-50 text-success-600 hover:bg-success-100 transition-colors cursor-pointer min-h-[44px]">
                ✓ Todos presentes
              </button>
              <button onClick={() => marcarTodos(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-danger-50 text-danger-600 hover:bg-danger-100 transition-colors cursor-pointer min-h-[44px]">
                ✗ Todos ausentes
              </button>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="w-8 h-8 text-accent-500 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-muted font-medium text-sm">Cargando lista...</p>
            </div>
          ) : lista.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted">
              <ClipboardCheck size={36} className="mb-2 text-secondary-200" />
              No hay alumnos inscriptos en este taller
            </div>
          ) : (
            <div className="divide-y divide-secondary-100">
              {lista.map((item) => (
                <button key={item.alumno.id} onClick={() => togglePresente(item.alumno.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover-row transition-colors cursor-pointer text-left">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 transition-colors ${
                      item.presente === true ? 'bg-success-500' :
                      item.presente === false ? 'bg-danger-500' :
                      'bg-secondary-300'
                    }`}>
                      {item.alumno.nombre.charAt(0)}{item.alumno.apellido.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-heading">{item.alumno.apellido}, {item.alumno.nombre}</p>
                      <p className="text-xs text-muted font-mono">{item.alumno.dni}</p>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                    item.presente === true ? 'bg-success-500 text-white' :
                    item.presente === false ? 'bg-danger-500 text-white' :
                    'bg-secondary-100 text-secondary-400 border-2 border-dashed border-secondary-300'
                  }`}>
                    {item.presente === true ? <Check size={22} /> :
                     item.presente === false ? <XIcon size={22} /> : '?'}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Save — sticky on mobile for reach */}
          {lista.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 bg-surface-alt border-t border-card sticky-bottom-mobile">
              {message && (
                <span className={`text-sm font-medium ${message.includes('Error') ? 'text-danger-500' : 'text-success-500'}`}>{message}</span>
              )}
              <button onClick={guardar} disabled={saving}
                className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-500 to-accent-400 hover:from-accent-600 hover:to-accent-500 text-white text-sm font-semibold shadow-lg shadow-accent-500/20 disabled:opacity-50 transition-all cursor-pointer min-h-[44px]">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Guardando...' : 'Guardar Asistencia'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
