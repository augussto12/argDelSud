import { useToastStore } from '../hooks/useToastStore';
import type { ToastType } from '../hooks/useToastStore';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ICON_MAP: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLE_MAP: Record<ToastType, string> = {
  success: 'border-success-500 bg-success-50 text-success-800',
  error: 'border-danger-500 bg-danger-50 text-danger-800',
  warning: 'border-warning-500 bg-warning-50 text-warning-800',
  info: 'border-accent-500 bg-accent-50 text-accent-800',
};

const ICON_STYLE_MAP: Record<ToastType, string> = {
  success: 'text-success-500',
  error: 'text-danger-500',
  warning: 'text-warning-500',
  info: 'text-accent-500',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = ICON_MAP[toast.type];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border-l-4 shadow-lg backdrop-blur-sm animate-slideInRight ${STYLE_MAP[toast.type]}`}
            role="alert"
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${ICON_STYLE_MAP[toast.type]}`} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">{toast.title}</p>
              {toast.message && (
                <p className="text-xs mt-0.5 opacity-80">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-0.5 rounded-md hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 opacity-50" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
