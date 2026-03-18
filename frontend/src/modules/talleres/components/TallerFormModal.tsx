import Modal from '../../../shared/components/Modal';
import type { Taller, Dia } from '../../../shared/types';
import type { Profesor, DiaForm } from '../types';
import { CATEGORIAS } from '../types';
import { ChevronDown, X } from 'lucide-react';

interface Props {
  editing: Taller | null;
  form: Record<string, string>;
  setForm: (f: any) => void;
  diasForm: DiaForm[];
  dias: Dia[];
  profesores: Profesor[];
  fieldErrors: Record<string, string>;
  setFieldErrors: (f: any) => void;
  savingLoad: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onAddDia: () => void;
  onRemoveDia: (i: number) => void;
  onUpdateDia: (i: number, field: keyof DiaForm, value: any) => void;
}

export default function TallerFormModal({
  editing, form, setForm, diasForm, dias, profesores,
  fieldErrors, setFieldErrors, savingLoad,
  onClose, onSubmit, onAddDia, onRemoveDia, onUpdateDia,
}: Props) {
  return (
    <Modal open onClose={onClose} title={editing ? 'Editar Taller' : 'Nuevo Taller'}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Nombre <span className="text-danger-500">*</span></label>
            <input type="text" value={form.nombre} maxLength={100}
              onChange={e => { setForm({ ...form, nombre: e.target.value }); if (fieldErrors.nombre) setFieldErrors({ ...fieldErrors, nombre: '' }); }}
              className={`w-full py-2.5 px-3 rounded-lg border bg-card text-body text-sm font-medium ${fieldErrors.nombre ? 'border-danger-400' : 'border-card'}`} placeholder="Ej: Fútbol Sub-12" />
            {fieldErrors.nombre && <p className="mt-1 text-xs text-danger-500">{fieldErrors.nombre}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Categoría</label>
            <div className="relative">
              <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}
                className="w-full py-2.5 pl-3 pr-8 rounded-lg border border-card bg-card text-body text-sm font-medium appearance-none cursor-pointer">
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Precio Mensual ($) <span className="text-danger-500">*</span></label>
            <input type="number" min="0" step="0.01" value={form.precio_mensual}
              onChange={e => { setForm({ ...form, precio_mensual: e.target.value }); if (fieldErrors.precio_mensual) setFieldErrors({ ...fieldErrors, precio_mensual: '' }); }}
              className={`w-full py-2.5 px-3 rounded-lg border bg-card text-body text-sm font-medium ${fieldErrors.precio_mensual ? 'border-danger-400' : 'border-card'}`} placeholder="10000" />
            {fieldErrors.precio_mensual && <p className="mt-1 text-xs text-danger-500">{fieldErrors.precio_mensual}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Cupo Máximo <span className="text-danger-500">*</span></label>
            <input type="number" min="1" step="1" value={form.cupo_maximo}
              onChange={e => { setForm({ ...form, cupo_maximo: e.target.value }); if (fieldErrors.cupo_maximo) setFieldErrors({ ...fieldErrors, cupo_maximo: '' }); }}
              className={`w-full py-2.5 px-3 rounded-lg border bg-card text-body text-sm font-medium ${fieldErrors.cupo_maximo ? 'border-danger-400' : 'border-card'}`} />
            {fieldErrors.cupo_maximo && <p className="mt-1 text-xs text-danger-500">{fieldErrors.cupo_maximo}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Profesor <span className="text-danger-500">*</span></label>
            <div className="relative">
              <select value={form.profesor_id}
                onChange={e => { setForm({ ...form, profesor_id: e.target.value }); if (fieldErrors.profesor_id) setFieldErrors({ ...fieldErrors, profesor_id: '' }); }}
                className={`w-full py-2.5 pl-3 pr-8 rounded-lg border bg-card text-body text-sm font-medium appearance-none cursor-pointer ${fieldErrors.profesor_id ? 'border-danger-400' : 'border-card'}`}>
                <option value="">Seleccionar...</option>
                {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>
            {fieldErrors.profesor_id && <p className="mt-1 text-xs text-danger-500">{fieldErrors.profesor_id}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Fecha Inicio <span className="text-danger-500">*</span></label>
            <input type="date" value={form.fecha_inicio}
              onChange={e => { setForm({ ...form, fecha_inicio: e.target.value }); if (fieldErrors.fecha_inicio) setFieldErrors({ ...fieldErrors, fecha_inicio: '' }); }}
              className={`w-full py-2.5 px-3 rounded-lg border bg-card text-body text-sm font-medium ${fieldErrors.fecha_inicio ? 'border-danger-400' : 'border-card'}`} />
            {fieldErrors.fecha_inicio && <p className="mt-1 text-xs text-danger-500">{fieldErrors.fecha_inicio}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Fecha Fin <span className="text-danger-500">*</span></label>
            <input type="date" value={form.fecha_fin}
              onChange={e => { setForm({ ...form, fecha_fin: e.target.value }); if (fieldErrors.fecha_fin) setFieldErrors({ ...fieldErrors, fecha_fin: '' }); }}
              className={`w-full py-2.5 px-3 rounded-lg border bg-card text-body text-sm font-medium ${fieldErrors.fecha_fin ? 'border-danger-400' : 'border-card'}`} />
            {fieldErrors.fecha_fin && <p className="mt-1 text-xs text-danger-500">{fieldErrors.fecha_fin}</p>}
          </div>
        </div>

        {/* Días y horarios */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-muted uppercase tracking-wider">Días y Horarios</label>
            <button type="button" onClick={onAddDia} className="text-xs text-accent-500 hover:text-accent-600 font-semibold cursor-pointer">+ Agregar día</button>
          </div>
          <div className="space-y-2">
            {diasForm.map((d, i) => (
              <div key={i} className="flex items-center gap-2 bg-surface rounded-lg p-2.5">
                <div className="relative flex-1">
                  <select value={d.dia_id} onChange={e => onUpdateDia(i, 'dia_id', e.target.value)}
                    className="w-full py-1.5 pl-2 pr-6 rounded border border-card bg-card text-body text-xs font-medium appearance-none cursor-pointer">
                    {dias.map(dia => <option key={dia.id} value={dia.id}>{dia.nombre}</option>)}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted pointer-events-none" />
                </div>
                <input type="time" value={d.hora_inicio} onChange={e => onUpdateDia(i, 'hora_inicio', e.target.value)}
                  className="py-1.5 px-2 rounded border border-card bg-card text-body text-xs font-medium w-24" />
                <span className="text-xs text-muted">a</span>
                <input type="time" value={d.hora_fin} onChange={e => onUpdateDia(i, 'hora_fin', e.target.value)}
                  className="py-1.5 px-2 rounded border border-card bg-card text-body text-xs font-medium w-24" />
                {diasForm.length > 1 && (
                  <button type="button" onClick={() => onRemoveDia(i)} className="p-1 rounded hover:bg-danger-50 cursor-pointer">
                    <X className="w-3.5 h-3.5 text-danger-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-8">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-card text-body font-semibold hover:bg-surface transition-colors cursor-pointer text-sm">
          Cancelar
        </button>
        <button onClick={onSubmit} disabled={savingLoad || !form.nombre || !form.precio_mensual || !form.profesor_id || !form.fecha_inicio || !form.fecha_fin || diasForm.length === 0}
          className="flex-1 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer text-sm">
          {savingLoad ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Taller'}
        </button>
      </div>
    </Modal>
  );
}
