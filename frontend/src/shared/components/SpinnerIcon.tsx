interface SpinnerIconProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

/**
 * SVG spinner icon reutilizable.
 * Reemplaza el SVG duplicado en PageLoader, Spinner y TableLoader.
 */
export default function SpinnerIcon({ size = 'md', className = '' }: SpinnerIconProps) {
  return (
    <svg
      className={`${sizeClasses[size]} text-accent-500 animate-spin ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
