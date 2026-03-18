import { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, User } from 'lucide-react';
import PageLoader from '../../shared/components/PageLoader';
import { useTesoreriaCuotas } from './hooks/useTesoreriaCuotas';
import { useTesoreriaDeudores } from './hooks/useTesoreriaDeudores';
import { useTesoreriaCuenta } from './hooks/useTesoreriaCuenta';
import CuotasTab from './components/CuotasTab';
import DeudoresTab from './components/DeudoresTab';
import CuentaAlumnoTab from './components/CuentaAlumnoTab';
import PagoModal from './components/PagoModal';
import DetalleCuotaModal from './components/DetalleCuotaModal';
import type { Tab, Cuota } from './types';

export default function TesoreriaPage() {
  const [activeTab, setActiveTab] = useState<Tab>('cuotas');
  const [mensaje, setMensaje] = useState('');

  // Modal state
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState<Cuota | null>(null);

  // Hooks
  const cuotasHook = useTesoreriaCuotas();
  const deudoresHook = useTesoreriaDeudores();
  const cuentaHook = useTesoreriaCuenta();

  // Fetch on tab change
  useEffect(() => {
    if (activeTab === 'cuotas') { cuotasHook.setPage(1); cuotasHook.fetchCuotas(); }
  }, [cuotasHook.fetchCuotas, activeTab]);

  useEffect(() => {
    if (activeTab === 'deudores') { deudoresHook.setPage(1); deudoresHook.fetchDeudores(); }
  }, [deudoresHook.fetchDeudores, activeTab]);

  const tabs: { key: Tab; label: string; icon: typeof DollarSign }[] = [
    { key: 'cuotas', label: 'Cuotas del Mes', icon: DollarSign },
    { key: 'deudores', label: 'Deudores', icon: AlertTriangle },
    { key: 'cuenta', label: 'Cuenta Alumno', icon: User },
  ];

  if (cuotasHook.loadingPage) return <PageLoader text="Cargando tesorería..." />;

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Tesorería</h1>
          <p className="text-muted text-sm mt-1">Gestión de cuotas, pagos y deudas</p>
        </div>
      </div>

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

      {/* Tab content */}
      {activeTab === 'cuotas' && (
        <CuotasTab
          {...cuotasHook}
          onGenerarMasivo={cuotasHook.handleGenerarMasivo}
          onOpenPago={c => { setSelectedCuota(c); setShowPagoModal(true); }}
          onOpenDetalle={c => { setSelectedCuota(c); setShowDetalle(true); }}
          onAnular={cuotasHook.handleAnularCuota}
        />
      )}

      {activeTab === 'deudores' && (
        <DeudoresTab
          {...deudoresHook}
          talleres={cuotasHook.talleres}
          onViewCuenta={id => { cuentaHook.setSelectedAlumnoId(id); setActiveTab('cuenta'); }}
        />
      )}

      {activeTab === 'cuenta' && (
        <CuentaAlumnoTab
          searchAlumno={cuentaHook.searchAlumno}
          setSearchAlumno={cuentaHook.setSearchAlumno}
          alumnosResults={cuentaHook.alumnosResults}
          cuentaData={cuentaHook.cuentaData}
          selectedAlumnoId={cuentaHook.selectedAlumnoId}
          onSelectAlumno={cuentaHook.selectAlumno}
          onClearAlumno={cuentaHook.clearAlumno}
        />
      )}

      {/* Modals */}
      {showPagoModal && selectedCuota && (
        <PagoModal
          cuota={selectedCuota}
          loading={cuotasHook.loadingAction}
          onClose={() => setShowPagoModal(false)}
          onSubmit={(cuotaId, form, onSuccess) => {
            cuotasHook.handleRegistrarPago(cuotaId, form, () => {
              onSuccess();
              if (cuentaHook.selectedAlumnoId) cuentaHook.fetchCuenta(cuentaHook.selectedAlumnoId);
            });
          }}
        />
      )}

      {showDetalle && selectedCuota && (
        <DetalleCuotaModal
          cuota={selectedCuota}
          onClose={() => setShowDetalle(false)}
        />
      )}
    </div>
  );
}
