import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  theme = 'dark',
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  theme?: 'dark' | 'light';
  className?: string;
}) {
  const dark = theme === 'dark';
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p
            className={cn(
              'text-xs font-bold uppercase tracking-wider',
              dark ? 'text-volt-400' : 'text-brand-600',
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            'mt-1 text-2xl font-bold tracking-tight sm:text-3xl',
            dark ? 'text-white' : 'text-ink-900',
          )}
        >
          {title}
        </h1>
        {description ? (
          <div
            className={cn(
              'mt-2 max-w-2xl text-sm sm:text-base',
              dark ? 'text-white/55' : 'text-ink-600',
            )}
          >
            {description}
          </div>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
