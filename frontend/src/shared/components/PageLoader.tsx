import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  text?: string;
}

/**
 * Spinner de carga reutilizable para todas las páginas.
 * Uso: {loading && <PageLoader text="Cargando alumnos..." />}
 */
export default function PageLoader({ text = 'Cargando...' }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-32 animate-fadeIn">
      <Loader2 className="w-10 h-10 text-accent-500 animate-spin mb-4" />
      <p className="text-muted font-medium text-sm">{text}</p>
    </div>
  );
}
