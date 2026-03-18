import Modal from '../../../shared/components/Modal';
import { Clock, UserPlus } from 'lucide-react';

interface Props {
  taller: any;
  onClose: () => void;
  onInscribir: (tallerId: number) => void;
  onDesinscribir: (tallerId: number, alumnoId: number) => void;
}

export default function TallerDetalleModal({ taller, onClose, onInscribir, onDesinscribir }: Props) {
  return (
    <Modal open onClose={onClose} title={taller.nombre}>
      <p className="text-sm text-muted mb-5 -mt-4">{taller.categoria} · {taller.profesor?.nombre} {taller.profesor?.apellido}</p>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-surface rounded-xl p-3 text-center">
          <p className="text-xs text-muted font-semibold uppercase mb-1">Precio</p>
          <p className="text-lg font-bold text-heading">${Number(taller.precio_mensual).toLocaleString()}</p>
        </div>
        <div className="bg-surface rounded-xl p-3 text-center">
          <p className="text-xs text-muted font-semibold uppercase mb-1">Cupo</p>
          <p className="text-lg font-bold text-heading">{taller.inscripciones?.length ?? 0}/{taller.cupo_maximo}</p>
        </div>
        <div className="bg-surface rounded-xl p-3 text-center">
          <p className="text-xs text-muted font-semibold uppercase mb-1">Días</p>
          <p className="text-lg font-bold text-heading">{taller.tallerDias?.length ?? 0}</p>
        </div>
      </div>

      {/* Schedule pills */}
      {taller.tallerDias && taller.tallerDias.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {taller.tallerDias.map((td: any, i: number) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-accent-50 text-accent-600 font-medium">
              <Clock size={11} />
              {td.dia?.nombre} {td.hora_inicio?.slice?.(11, 16) || td.hora_inicio} - {td.hora_fin?.slice?.(11, 16) || td.hora_fin}
            </span>
          ))}
        </div>
      )}

      <h4 className="text-sm font-bold text-heading mb-3">Alumnos inscriptos</h4>
      {taller.inscripciones && taller.inscripciones.length > 0 ? (
        <div className="space-y-1.5">
          {taller.inscripciones.map((insc: any) => (
            <div key={insc.alumno?.id || insc.id} className="flex items-center justify-between bg-surface rounded-lg px-4 py-2.5">
              <div>
                <span className="text-sm font-medium text-heading">{insc.alumno?.apellido}, {insc.alumno?.nombre}</span>
                <span className="text-xs text-muted ml-2">DNI: {insc.alumno?.dni}</span>
              </div>
              <button onClick={() => onDesinscribir(taller.id, insc.alumno?.id)}
                className="text-xs text-danger-400 hover:text-danger-500 font-semibold cursor-pointer">
                Quitar
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted py-3 text-center">No hay alumnos inscriptos</p>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={() => { onClose(); onInscribir(taller.id); }}
          className="flex-1 py-2.5 rounded-xl bg-success-500 hover:bg-success-600 text-white font-semibold transition-colors cursor-pointer text-sm">
          Inscribir Alumno
        </button>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-card text-body font-semibold hover:bg-surface transition-colors cursor-pointer text-sm">
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
