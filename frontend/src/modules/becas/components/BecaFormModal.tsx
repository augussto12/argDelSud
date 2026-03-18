import Modal from '../../../shared/components/Modal';
import type { Beca, Inscripcion } from '../hooks/useBecas';

interface Props {
  editingBeca: Beca | null;
  form: { inscripcion_id: string; porcentaje_descuento: string; motivo: string; fecha_inicio: string; fecha_fin: string; aplicar_cuota_actual: boolean };
  setForm: (f: any) => void;
  inscripciones: Inscripcion[];
  searchInsc: string;
  setSearchInsc: (v: string) => void;
  fieldErrors: Record<string, string>;
  setFieldErrors: (f: any) => void;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function BecaFormModal({
  editingBeca, form, setForm, inscripciones,
  searchInsc, setSearchInsc,
  fieldErrors, setFieldErrors, loading,
  onClose, onSubmit,
}: Props) {
  return (
    <Modal open onClose={onClose} title={editingBeca ? 'Editar Beca' : 'Nueva Beca'} maxWidth="max-w-md">
      <div className="space-y-5">
        {!editingBeca && (
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Inscripción (Alumno + Taller) <span className="text-danger-500">*</span></label>
            {form.inscripcion_id ? (
              <div className="flex items-center gap-2 py-2.5 px-3 rounded-lg border border-accent-300 bg-accent-50 text-accent-700 text-sm font-semibold">
                <span className="flex-1">
                  {inscripciones.find(i => String(i.id) === form.inscripcion_id)
                    ? (() => { const i = inscripciones.find(x => String(x.id) === form.inscripcion_id)!; return `${i.alumno.apellido}, ${i.alumno.nombre} — ${i.taller.nombre}`; })()
                    : 'Inscripción seleccionada'}
                </span>
                <button type="button" onClick={() => { setForm({ ...form, inscripcion_id: '' }); setSearchInsc(''); }}
                  className="text-accent-500 hover:text-accent-700 font-bold cursor-pointer text-lg leading-none">&times;</button>
              </div>
            ) : (
              <>
                <input type="text" placeholder="Buscar por nombre, apellido o DNI..." value={searchInsc}
                  onChange={e => setSearchInsc(e.target.value)}
                  className={`w-full py-2 px-3 rounded-lg border bg-card text-body text-sm mb-2 ${fieldErrors.inscripcion_id ? 'border-danger-400' : 'border-card'}`} />
                <div style={{ maxHeight: '180px', overflowY: 'auto' }}
                  className="rounded-lg border border-card">
                  {inscripciones.length === 0 ? (
                    <p className="text-center text-muted text-sm py-4">No se encontraron inscripciones</p>
                  ) : (
                    inscripciones.map(i => (
                      <div key={i.id}
                        onClick={() => { setForm({ ...form, inscripcion_id: String(i.id) }); if (fieldErrors.inscripcion_id) setFieldErrors({ ...fieldErrors, inscripcion_id: '' }); }}
                        style={{ cursor: 'pointer' }}
                        className="w-full text-left px-3 py-2.5 text-sm border-b border-card last:border-b-0 hover:bg-accent-50 hover:text-accent-700 text-body">
                        {i.alumno.apellido}, {i.alumno.nombre} — {i.taller.nombre}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
            {fieldErrors.inscripcion_id && <p className="mt-1 text-xs text-danger-500">{fieldErrors.inscripcion_id}</p>}
          </div>
        )}
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">% Descuento <span className="text-danger-500">*</span></label>
          <input type="number" min="1" max="100" value={form.porcentaje_descuento}
            onChange={e => { setForm({ ...form, porcentaje_descuento: e.target.value }); if (fieldErrors.porcentaje_descuento) setFieldErrors({ ...fieldErrors, porcentaje_descuento: '' }); }}
            className={`w-full py-2.5 px-3 rounded-lg border bg-card text-body text-sm font-medium ${fieldErrors.porcentaje_descuento ? 'border-danger-400' : 'border-card'}`} placeholder="50" />
          {fieldErrors.porcentaje_descuento && <p className="mt-1 text-xs text-danger-500">{fieldErrors.porcentaje_descuento}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Motivo (opcional)</label>
          <input type="text" value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })}
            className="w-full py-2.5 px-3 rounded-lg border border-card bg-card text-body text-sm font-medium" placeholder="Situación económica, mérito deportivo..." />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Desde <span className="text-danger-500">*</span></label>
            <input type="date" value={form.fecha_inicio}
              onChange={e => { setForm({ ...form, fecha_inicio: e.target.value }); if (fieldErrors.fecha_inicio) setFieldErrors({ ...fieldErrors, fecha_inicio: '' }); }}
              className={`w-full py-2.5 px-3 rounded-lg border bg-card text-body text-sm font-medium ${fieldErrors.fecha_inicio ? 'border-danger-400' : 'border-card'}`} />
            {fieldErrors.fecha_inicio && <p className="mt-1 text-xs text-danger-500">{fieldErrors.fecha_inicio}</p>}
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Hasta <span className="text-danger-500">*</span></label>
            <input type="date" value={form.fecha_fin}
              onChange={e => { setForm({ ...form, fecha_fin: e.target.value }); if (fieldErrors.fecha_fin) setFieldErrors({ ...fieldErrors, fecha_fin: '' }); }}
              className={`w-full py-2.5 px-3 rounded-lg border bg-card text-body text-sm font-medium ${fieldErrors.fecha_fin ? 'border-danger-400' : 'border-card'}`} />
            {fieldErrors.fecha_fin && <p className="mt-1 text-xs text-danger-500">{fieldErrors.fecha_fin}</p>}
          </div>
        </div>
        <label className="flex items-start gap-3 p-3 rounded-xl bg-accent-50 border border-accent-200 cursor-pointer select-none">
          <input type="checkbox" checked={form.aplicar_cuota_actual}
            onChange={e => setForm({ ...form, aplicar_cuota_actual: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-accent-300 text-accent-500 accent-accent-500 cursor-pointer" />
          <div>
            <span className="text-sm font-semibold text-accent-700 block">Aplicar a la cuota actual</span>
            <span className="text-xs text-accent-600/70">Si el alumno tiene una cuota pendiente de este mes, se le recalcula el monto con el nuevo descuento</span>
          </div>
        </label>
      </div>
      <div className="flex gap-3 mt-8">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-card text-body font-semibold hover:bg-surface transition-colors cursor-pointer text-sm">
          Cancelar
        </button>
        <button onClick={onSubmit} disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer text-sm">
          {loading ? 'Guardando...' : editingBeca ? 'Actualizar' : 'Crear Beca'}
        </button>
      </div>
    </Modal>
  );
}
