export interface Profesor { id: number; nombre: string; apellido: string }
export interface DiaForm { dia_id: number; hora_inicio: string; hora_fin: string }
export interface InscriptoInfo { id: number; nombre: string; apellido: string; dni: string }

export const EMPTY_FORM = {
  nombre: '', categoria: 'Deportes', precio_mensual: '', cupo_maximo: '30',
  profesor_id: '', fecha_inicio: '', fecha_fin: '',
};

export const CATEGORIAS = ['Deportes', 'Arte', 'Música', 'Educación', 'Otro'];
