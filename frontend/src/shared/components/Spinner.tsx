interface SpinnerProps {
  text?: string;
  size?: 'sm' | 'md';
}

export default function Spinner({ text, size = 'md' }: SpinnerProps) {
  const sizeClass = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <svg className={`${sizeClass} text-accent-500 animate-spin mb-3`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {text && <p className="text-muted font-medium text-sm">{text}</p>}
    </div>
  );
}
