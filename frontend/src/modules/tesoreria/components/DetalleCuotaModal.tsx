import Modal from '../../../shared/components/Modal';
import type { Cuota } from '../types';
import { MESES, fmtMoney } from '../types';
import { CreditCard } from 'lucide-react';

interface Props {
  cuota: Cuota;
  onClose: () => void;
}

export default function DetalleCuotaModal({ cuota, onClose }: Props) {
  return (
    <Modal open onClose={onClose} title="Detalle de Cuota">
      <p className="text-muted text-sm mb-6 -mt-4">
        {cuota.inscripcion.alumno.apellido}, {cuota.inscripcion.alumno.nombre} — {MESES[cuota.mes]} {cuota.anio}
      </p>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-surface rounded-xl p-4 text-center">
          <p className="text-xs text-muted font-semibold uppercase mb-1">Original</p>
          <p className="text-lg font-bold text-heading">{fmtMoney(cuota.monto_original)}</p>
        </div>
        <div className="bg-surface rounded-xl p-4 text-center">
          <p className="text-xs text-muted font-semibold uppercase mb-1">Descuento</p>
          <p className="text-lg font-bold text-success-600">{fmtMoney(cuota.descuento_aplicado)}</p>
        </div>
        <div className="bg-surface rounded-xl p-4 text-center">
          <p className="text-xs text-muted font-semibold uppercase mb-1">A Pagar</p>
          <p className="text-lg font-bold text-heading">{fmtMoney(cuota.monto_final)}</p>
        </div>
      </div>
      {cuota.pagos.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-heading mb-3">Pagos registrados</h4>
          <div className="space-y-2">
            {cuota.pagos.map(p => (
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
      <button onClick={onClose} className="w-full mt-6 py-2.5 rounded-xl border border-card text-body font-semibold hover:bg-surface transition-colors cursor-pointer text-sm">
        Cerrar
      </button>
    </Modal>
  );
}
