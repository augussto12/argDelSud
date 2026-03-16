export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: string;
  telefono?: string;
  telefono_tutor?: string;
  nombre_tutor?: string;
  direccion?: string;
  notas?: string;
  activo: boolean;
  inscripciones?: Inscripcion[];
}

export interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  especialidad?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  talleres?: Taller[];
}

export interface Taller {
  id: number;
  nombre: string;
  categoria: string;
  precio_mensual: number;
  cupo_maximo: number;
  profesor_id: number;
  profesor?: { id: number; nombre: string; apellido: string };
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  tallerDias?: TallerDia[];
  _count?: { inscripciones: number };
}

export interface TallerDia {
  taller_id: number;
  dia_id: number;
  hora_inicio: string;
  hora_fin: string;
  dia?: Dia;
}

export interface Dia {
  id: number;
  nombre: string;
}

export interface Inscripcion {
  id: number;
  alumno_id: number;
  taller_id: number;
  fecha_inscripcion: string;
  activa: boolean;
  taller?: Taller;
  alumno?: Alumno;
}

export interface Cuota {
  id: number;
  inscripcion_id: number;
  mes: number;
  anio: number;
  monto_original: number;
  descuento_aplicado: number;
  monto_final: number;
  estado: 'pendiente' | 'pagada' | 'anulada';
}

export interface Pago {
  id: number;
  cuota_id: number;
  monto_abonado: number;
  metodo_pago: string;
  observaciones?: string;
  creado_at: string;
}

export interface Beca {
  id: number;
  inscripcion_id: number;
  porcentaje_descuento: number;
  motivo?: string;
  fecha_inicio: string;
  fecha_fin: string;
  activa: boolean;
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
}
