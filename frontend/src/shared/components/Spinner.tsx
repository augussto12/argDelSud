import SpinnerIcon from './SpinnerIcon';

interface SpinnerProps {
  text?: string;
  size?: 'sm' | 'md';
}

export default function Spinner({ text, size = 'md' }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <SpinnerIcon size={size} className="mb-3" />
      {text && <p className="text-muted font-medium text-sm">{text}</p>}
    </div>
  );
}
