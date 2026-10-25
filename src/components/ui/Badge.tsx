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

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200',
  brand: 'bg-brand-50 text-brand-800 ring-brand-200',
  accent: 'bg-accent-50 text-accent-800 ring-accent-200',
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  accepted: 'bg-brand-50 text-brand-800 ring-brand-200',
  completed: 'bg-accent-50 text-accent-800 ring-accent-200',
  cancelled: 'bg-ink-100 text-ink-600 ring-ink-200',
  warning: 'bg-red-50 text-red-700 ring-red-200',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
  icon,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
