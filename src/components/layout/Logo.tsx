import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

/** Tutor UG wordmark + logo mark (inline SVG, no external assets). */
export function Logo({
  className,
  variant = 'dark',
  to = '/',
}: {
  className?: string;
  variant?: 'dark' | 'light';
  to?: string | null;
}) {
  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
          variant === 'light' ? 'bg-white/10' : 'bg-brand-800',
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M12 3 2.8 7.4a1 1 0 0 0 0 1.83L12 13.6l9.2-4.37a1 1 0 0 0 0-1.83L12 3Z"
            fill={variant === 'light' ? '#ffffff' : '#ffffff'}
            fillOpacity={variant === 'light' ? 0.95 : 1}
          />
          <path
            d="M6 10.4v4.2c0 1.7 2.7 3.4 6 3.4s6-1.7 6-3.4v-4.2"
            stroke={variant === 'light' ? '#ffffff' : '#7bd3ac'}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M21.2 9v5" stroke={variant === 'light' ? '#ffffff' : '#7bd3ac'} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        Tutor<span className={variant === 'light' ? 'text-accent-300' : 'text-accent-600'}>UG</span>
      </span>
    </span>
  );

  if (!to) {
    return content;
  }

  return (
    <Link to={to} className="rounded-lg text-ink-900 transition hover:opacity-90" aria-label="Tutor UG home">
      {content}
    </Link>
  );
}
