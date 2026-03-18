import { useConfirmStore } from '../hooks/useConfirmStore';
import { AlertTriangle, Info } from 'lucide-react';

const variantStyles = {
  danger: {
    icon: 'bg-danger-100 text-danger-600',
    button: 'bg-danger-500 hover:bg-danger-600 focus:ring-danger-500/30',
  },
  warning: {
    icon: 'bg-warning-100 text-warning-600',
    button: 'bg-warning-500 hover:bg-warning-600 focus:ring-warning-500/30',
  },
  default: {
    icon: 'bg-accent-100 text-accent-600',
    button: 'bg-accent-500 hover:bg-accent-600 focus:ring-accent-500/30',
  },
};

export default function ConfirmModal() {
  const { isOpen, options, confirm, cancel } = useConfirmStore();

  if (!isOpen) return null;

  const variant = options.variant || 'default';
  const styles = variantStyles[variant];
  const Icon = variant === 'default' ? Info : AlertTriangle;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={cancel} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slideUp border border-card">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${styles.icon}`}>
            <Icon size={24} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          {options.title && (
            <h3 className="text-lg font-bold text-heading mb-1">{options.title}</h3>
          )}
          <p className="text-sm text-body leading-relaxed">{options.message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={cancel}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-secondary-600 bg-surface hover:bg-secondary-200 rounded-xl transition-colors cursor-pointer"
          >
            {options.cancelText || 'Cancelar'}
          </button>
          <button
            onClick={confirm}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors focus:outline-none focus:ring-2 cursor-pointer ${styles.button}`}
          >
            {options.confirmText || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
