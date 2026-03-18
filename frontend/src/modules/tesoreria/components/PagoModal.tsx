import { useState } from 'react';
import Modal from '../../../shared/components/Modal';
import type { Cuota } from '../types';
import { MESES, METODO_ICONS, fmtMoney } from '../types';
import { Banknote } from 'lucide-react';

interface Props {
  cuota: Cuota;
  loading: boolean;
  onClose: () => void;
  onSubmit: (cuotaId: number, form: { monto_abonado: string; metodo_pago: string; observaciones: string }, onSuccess: () => void) => void;
}

export default function PagoModal({ cuota, loading, onClose, onSubmit }: Props) {
  const totalAbonado = cuota.pagos.reduce((s, p) => s + parseFloat(p.monto_abonado), 0);
  const saldo = parseFloat(cuota.monto_final) - totalAbonado;

  const [form, setForm] = useState({
    monto_abonado: saldo.toFixed(2),
    metodo_pago: 'efectivo',
    observaciones: '',
  });

  return (
    <Modal open onClose={onClose} title="Registrar Pago" maxWidth="max-w-md">
      <p className="text-muted text-sm mb-1 -mt-4">
        {cuota.inscripcion.alumno.apellido}, {cuota.inscripcion.alumno.nombre} — {cuota.inscripcion.taller.nombre}
      </p>
      <p className="text-muted text-xs mb-6">
        {MESES[cuota.mes]} {cuota.anio} • Monto: {fmtMoney(cuota.monto_final)}
      </p>
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Monto a abonar ($)</label>
          <input type="number" step="0.01" value={form.monto_abonado} onChange={e => setForm({ ...form, monto_abonado: e.target.value })}
            className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium" />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Método de pago</label>
          <div className="flex gap-2">
            {(['efectivo', 'transferencia', 'debito'] as const).map(m => {
              const Icon = METODO_ICONS[m] || Banknote;
              return (
                <button key={m} type="button" onClick={() => setForm({ ...form, metodo_pago: m })}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border font-medium text-xs transition-all cursor-pointer ${form.metodo_pago === m
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
          <textarea value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })}
            rows={2} className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium resize-none" />
        </div>
      </div>
      <div className="flex gap-3 mt-8">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-card text-body font-semibold hover:bg-surface transition-colors cursor-pointer text-sm">
          Cancelar
        </button>
        <button onClick={() => onSubmit(cuota.id, form, onClose)} disabled={loading || !form.monto_abonado}
          className="flex-1 py-2.5 rounded-xl bg-success-500 hover:bg-success-600 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer text-sm">
          {loading ? 'Registrando...' : 'Registrar Pago'}
        </button>
      </div>
    </Modal>
  );
}
