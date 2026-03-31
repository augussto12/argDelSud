import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-danger-100 text-danger-500 flex items-center justify-center mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-heading mb-2">Algo salió mal</h2>
          <p className="text-sm text-muted text-center max-w-md mb-6">
            Ocurrió un error inesperado. Podés intentar recargar la página.
          </p>
          {this.state.error && (
            <details className="mb-6 max-w-md w-full">
              <summary className="text-xs text-muted cursor-pointer hover:text-body transition-colors">
                Ver detalles del error
              </summary>
              <pre className="mt-2 p-3 bg-surface rounded-lg text-xs text-danger-500 overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-400 hover:from-accent-600 hover:to-accent-500 text-white font-semibold rounded-xl shadow-lg shadow-accent-500/20 transition-all hover:-translate-y-0.5 cursor-pointer text-sm"
          >
            <RefreshCw size={16} />
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
