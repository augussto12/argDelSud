interface PageLoaderProps {
  text?: string;
}

/**
 * Spinner de carga reutilizable para páginas completas.
 * Uso: if (loading) return <PageLoader text="Cargando..." />;
 */
export default function PageLoader({ text = 'Cargando...' }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-32 animate-fadeIn">
      <svg className="w-8 h-8 text-accent-500 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-muted font-medium text-sm">{text}</p>
    </div>
  );
}
