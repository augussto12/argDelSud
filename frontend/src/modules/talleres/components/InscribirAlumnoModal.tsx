import { useEffect } from 'react';
import Modal from '../../../shared/components/Modal';
import { UserPlus } from 'lucide-react';
import type { InscriptoInfo } from '../types';

interface Props {
  alumnos: InscriptoInfo[];
  alumnoSearch: string;
  setAlumnoSearch: (v: string) => void;
  onClose: () => void;
  onInscribir: (alumnoId: number) => void;
  fetchAlumnos: (q: string) => void;
}

export default function InscribirAlumnoModal({ alumnos, alumnoSearch, setAlumnoSearch, onClose, onInscribir, fetchAlumnos }: Props) {
  useEffect(() => {
    const timeout = setTimeout(() => fetchAlumnos(alumnoSearch), 300);
    return () => clearTimeout(timeout);
  }, [alumnoSearch]);

  return (
    <Modal open onClose={onClose} title="Inscribir Alumno" maxWidth="max-w-md">
      <input type="text" placeholder="Buscar por nombre, apellido o DNI..." value={alumnoSearch}
        onChange={e => setAlumnoSearch(e.target.value)}
        className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium mb-3" />
      <div className="max-h-60 overflow-y-auto space-y-1">
        {alumnos.length === 0 ? (
          <p className="text-sm text-muted text-center py-4">No se encontraron alumnos</p>
        ) : (
          alumnos.map(a => (
            <button key={a.id} onClick={() => onInscribir(a.id)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-surface transition-colors cursor-pointer text-left">
              <div>
                <span className="text-sm font-medium text-heading">{a.apellido}, {a.nombre}</span>
                <span className="text-xs text-muted ml-2">DNI: {a.dni}</span>
              </div>
              <UserPlus className="w-4 h-4 text-success-400" />
            </button>
          ))
        )}
      </div>
    </Modal>
  );
}
