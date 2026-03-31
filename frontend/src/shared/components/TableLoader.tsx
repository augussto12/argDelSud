import SpinnerIcon from './SpinnerIcon';

interface TableLoaderProps {
  colSpan: number;
  text?: string;
}

/**
 * Spinner de carga reutilizable para tablas.
 * Renderiza un <tr> con spinner centrado.
 * Uso: {loading && <TableLoader colSpan={6} text="Cargando alumnos..." />}
 */
export default function TableLoader({ colSpan, text = 'Cargando...' }: TableLoaderProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-16">
        <div className="flex flex-col items-center">
          <SpinnerIcon className="mb-3" />
          <p className="text-muted font-medium text-sm">{text}</p>
        </div>
      </td>
    </tr>
  );
}
