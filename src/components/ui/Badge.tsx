import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'accent'
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'cancelled'
  | 'warning';

const LIGHT_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200',
  brand: 'bg-brand-50 text-brand-800 ring-brand-200',
  accent: 'bg-accent-50 text-accent-800 ring-accent-200',
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  accepted: 'bg-brand-50 text-brand-800 ring-brand-200',
  completed: 'bg-accent-50 text-accent-800 ring-accent-200',
  cancelled: 'bg-ink-100 text-ink-600 ring-ink-200',
  warning: 'bg-red-50 text-red-700 ring-red-200',
};

const DARK_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-white/5 text-white/60 ring-white/10',
  brand: 'bg-[rgba(21,88,201,0.25)] text-[#9cc4ff] ring-[rgba(21,88,201,0.5)]',
  accent: 'bg-[rgba(212,255,36,0.12)] text-volt-400 ring-[rgba(212,255,36,0.3)]',
  pending: 'bg-[rgba(251,191,36,0.12)] text-amber-300 ring-[rgba(251,191,36,0.3)]',
  accepted: 'bg-[rgba(21,88,201,0.25)] text-[#9cc4ff] ring-[rgba(21,88,201,0.5)]',
  completed: 'bg-[rgba(212,255,36,0.12)] text-volt-400 ring-[rgba(212,255,36,0.3)]',
  cancelled: 'bg-[rgba(239,68,68,0.12)] text-red-300 ring-[rgba(239,68,68,0.3)]',
  warning: 'bg-[rgba(239,68,68,0.12)] text-red-300 ring-[rgba(239,68,68,0.3)]',
};

export function Badge({
  children,
  tone = 'neutral',
  theme = 'dark',
  className,
  icon,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  theme?: 'dark' | 'light';
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        (theme === 'dark' ? DARK_TONES : LIGHT_TONES)[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
