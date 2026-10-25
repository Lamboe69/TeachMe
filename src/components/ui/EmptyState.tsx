import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-ink-300 bg-white px-6 py-12 text-center',
        className,
      )}
    >
      {icon ? <div className="text-ink-400">{icon}</div> : null}
      <div>
        <p className="text-base font-semibold text-ink-800">{title}</p>
        {description ? (
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
