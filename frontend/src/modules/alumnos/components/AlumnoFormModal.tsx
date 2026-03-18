import { useState } from 'react';
import api from '../../../shared/api/client';
import type { Alumno } from '../../../shared/types';
import Modal from '../../../shared/components/Modal';
import { useToastStore } from '../../../shared/hooks/useToastStore';

interface Props {
  alumno: Alumno | null;
  onClose: () => void;
  onSaved: () => void;
}

function FormField({ label, name, value, onChange, type = 'text', required = false, maxLength, inputMode, onInput, error, placeholder }: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean; maxLength?: number; inputMode?: 'text' | 'numeric' | 'email' | 'tel';
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void; error?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
        {label} {required && <span className="text-danger-500">*</span>}
      </label>
      <input name={name} type={type} value={value} onChange={onChange} maxLength={maxLength}
        inputMode={inputMode} onInput={onInput} placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 rounded-xl border bg-input text-sm text-heading placeholder:text-secondary-400 focus:outline-none focus:ring-2 transition-colors ${error ? 'border-danger-400 focus:ring-danger-400/30 focus:border-danger-400' : 'border-input focus:ring-accent-400/30 focus:border-accent-400'}`} />
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  );
}

export default function AlumnoFormModal({ alumno, onClose, onSaved }: Props) {
  const isEdit = alumno !== null;
  const [form, setForm] = useState({
    nombre: alumno?.nombre || '', apellido: alumno?.apellido || '', dni: alumno?.dni || '',
    fecha_nacimiento: alumno?.fecha_nacimiento?.split('T')[0] || '', telefono: alumno?.telefono || '',
    telefono_tutor: alumno?.telefono_tutor || '', nombre_tutor: alumno?.nombre_tutor || '',
    direccion: alumno?.direccion || '', notas: alumno?.notas || '',
  });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const digitsOnly = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    else if (form.nombre.trim().length < 2) errs.nombre = 'Mínimo 2 caracteres';
    if (!form.apellido.trim()) errs.apellido = 'El apellido es obligatorio';
    else if (form.apellido.trim().length < 2) errs.apellido = 'Mínimo 2 caracteres';
    if (!form.dni.trim()) errs.dni = 'El DNI es obligatorio';
    else if (form.dni.trim().length < 7) errs.dni = 'El DNI debe tener al menos 7 dígitos';
    else if (!/^\d+$/.test(form.dni.trim())) errs.dni = 'El DNI solo debe contener números';
    if (!form.fecha_nacimiento) errs.fecha_nacimiento = 'La fecha de nacimiento es obligatoria';
    if (form.telefono && !/^\d*$/.test(form.telefono)) errs.telefono = 'Solo números';
    if (form.telefono_tutor && !/^\d*$/.test(form.telefono_tutor)) errs.telefono_tutor = 'Solo números';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setServerError('');
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) await api.put(`/alumnos/${alumno!.id}`, form);
      else await api.post('/alumnos', form);
      useToastStore.getState().success(isEdit ? 'Alumno editado exitosamente' : 'Alumno creado exitosamente');
      onSaved(); onClose();
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        const errs: Record<string, string> = {};
        data.errors.forEach((e: any) => { errs[e.campo] = e.mensaje; });
        setFieldErrors(errs);
      } else {
        const msg = data?.message;
        if (msg?.includes('DNI')) setServerError('Ya existe un alumno con ese DNI.');
        else setServerError(msg || 'Error al guardar. Verificá los datos.');
      }
    }
    finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Editar Alumno' : 'Nuevo Alumno'}>
      {serverError && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-danger-50 text-danger-600 border border-danger-100">{serverError}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required maxLength={100} error={fieldErrors.nombre} placeholder="Ej: Juan" />
          <FormField label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} required maxLength={100} error={fieldErrors.apellido} placeholder="Ej: Pérez" />
          <FormField label="DNI" name="dni" value={form.dni} onChange={handleChange} required maxLength={9} inputMode="numeric" onInput={digitsOnly} error={fieldErrors.dni} placeholder="Ej: 42567890" />
          <FormField label="Fecha Nacimiento" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} required error={fieldErrors.fecha_nacimiento} />
          <FormField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} maxLength={15} inputMode="numeric" onInput={digitsOnly} error={fieldErrors.telefono} placeholder="Ej: 2236001234" />
          <FormField label="Tel. Tutor" name="telefono_tutor" value={form.telefono_tutor} onChange={handleChange} maxLength={15} inputMode="numeric" onInput={digitsOnly} error={fieldErrors.telefono_tutor} placeholder="Ej: 2236005678" />
        </div>
        <FormField label="Nombre Tutor" name="nombre_tutor" value={form.nombre_tutor} onChange={handleChange} maxLength={200} placeholder="Ej: María García" />
        <FormField label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} placeholder="Ej: Av. Colón 1234" />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Notas</label>
          <textarea name="notas" value={form.notas} onChange={handleChange} rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border bg-input border-input text-sm text-heading placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-400 transition-colors resize-none" placeholder="Observaciones opcionales..." />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-card text-sm font-medium text-body hover:bg-secondary-50 transition-colors cursor-pointer">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors cursor-pointer">
            {saving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Alumno'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
