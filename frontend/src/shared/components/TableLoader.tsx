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
          <svg className="w-8 h-8 text-accent-500 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-muted font-medium text-sm">{text}</p>
        </div>
      </td>
    </tr>
  );
}
