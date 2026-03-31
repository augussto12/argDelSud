import SpinnerIcon from './SpinnerIcon';

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
      <SpinnerIcon className="mb-3" />
      <p className="text-muted font-medium text-sm">{text}</p>
    </div>
  );
}
