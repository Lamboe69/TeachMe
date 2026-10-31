import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function EmptyState({
  icon,
  title,
  description,
  action,
  theme = 'dark',
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  theme?: 'dark' | 'light';
  className?: string;
}) {
  const dark = theme === 'dark';
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-card border border-dashed px-6 py-12 text-center',
        dark
          ? 'border-[rgba(21,88,201,0.35)] bg-[rgba(21,88,201,0.06)]'
          : 'border-ink-300 bg-white',
        className,
      )}
    >
      {icon ? <div className={dark ? 'text-white/25' : 'text-ink-400'}>{icon}</div> : null}
      <div>
        <p className={cn('text-base font-semibold', dark ? 'text-white' : 'text-ink-800')}>
          {title}
        </p>
        {description ? (
          <p
            className={cn(
              'mx-auto mt-1 max-w-md text-sm',
              dark ? 'text-white/50' : 'text-ink-500',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
