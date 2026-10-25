import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

const TONES: Record<AlertTone, { wrapper: string; icon: ReactNode }> = {
  info: {
    wrapper: 'border-brand-200 bg-brand-50 text-brand-900',
    icon: <Info className="h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />,
  },
  success: {
    wrapper: 'border-accent-200 bg-accent-50 text-accent-900',
    icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-600" aria-hidden="true" />,
  },
  warning: {
    wrapper: 'border-amber-200 bg-amber-50 text-amber-900',
    icon: <TriangleAlert className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />,
  },
  error: {
    wrapper: 'border-red-200 bg-red-50 text-red-900',
    icon: <AlertCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />,
  },
};

export function Alert({
  tone = 'info',
  title,
  children,
  action,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const style = TONES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-xl border p-4 text-sm', style.wrapper, className)}
    >
      <span className="mt-0.5">{style.icon}</span>
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && 'mt-1', 'leading-relaxed')}>{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
