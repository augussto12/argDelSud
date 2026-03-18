import { Banknote, ArrowRightLeft, Landmark } from 'lucide-react';

export interface CuotaPago {
  id: number;
  monto_abonado: string;
  metodo_pago: string;
  creado_at: string;
}

export interface Cuota {
  id: number;
  mes: number;
  anio: number;
  monto_original: string;
  descuento_aplicado: string;
  monto_final: string;
  estado: string;
  inscripcion: {
    alumno: { id: number; nombre: string; apellido: string; dni: string };
    taller: { id: number; nombre: string };
  };
  pagos: CuotaPago[];
}

export interface TallerOption {
  id: number;
  nombre: string;
}

export interface Deudor {
  alumno: { id: number; nombre: string; apellido: string; dni: string };
  talleres: string[];
  mesesAtraso: number;
  deudaTotal: string;
  cuotasPendientes: number;
  ultimoPago: string | null;
  cuotas: { id: number; mes: number; anio: number; monto_final: string; abonado: string; saldo: string; taller: string }[];
}

export interface CuentaCuota {
  id: number;
  mes: number;
  anio: number;
  taller: { id: number; nombre: string };
  monto_original: string;
  descuento_aplicado: string;
  monto_final: string;
  abonado: string;
  saldo: string;
  estado: string;
  pagos: CuotaPago[];
}

export interface CuentaAlumno {
  alumno: { id: number; nombre: string; apellido: string; dni: string };
  resumen: {
    totalAdeudado: string;
    totalPagado: string;
    cuotasPendientes: number;
    cuotasPagadas: number;
    totalCuotas: number;
  };
  cuotas: CuentaCuota[];
}

export interface AlumnoSearch {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
}

export type Tab = 'cuotas' | 'deudores' | 'cuenta';

export const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const METODO_ICONS: Record<string, typeof Banknote> = {
  efectivo: Banknote,
  transferencia: ArrowRightLeft,
  debito: Landmark,
};

export const fmtMoney = (v: string | number) =>
  `$${parseFloat(String(v)).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export const estadoBadge = (estado: string) => {
  const styles: Record<string, string> = {
    pendiente: 'bg-warning-100 text-warning-700',
    pagada: 'bg-success-100 text-success-700',
    anulada: 'bg-danger-100 text-danger-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[estado] || 'bg-secondary-100 text-secondary-700'}`}>
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
};
