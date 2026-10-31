import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

const LIGHT_TONES: Record<AlertTone, { wrapper: string; icon: ReactNode }> = {
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

const DARK_TONES: Record<AlertTone, { wrapper: string; icon: ReactNode }> = {
  info: {
    wrapper: 'border-[rgba(21,88,201,0.4)] bg-[rgba(21,88,201,0.12)] text-white/75',
    icon: <Info className="h-5 w-5 shrink-0 text-[#7eb3ff]" aria-hidden="true" />,
  },
  success: {
    wrapper: 'border-[rgba(212,255,36,0.3)] bg-[rgba(212,255,36,0.08)] text-white/75',
    icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-volt-400" aria-hidden="true" />,
  },
  warning: {
    wrapper: 'border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.08)] text-white/75',
    icon: <TriangleAlert className="h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />,
  },
  error: {
    wrapper: 'border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.1)] text-white/75',
    icon: <AlertCircle className="h-5 w-5 shrink-0 text-red-300" aria-hidden="true" />,
  },
};

export function Alert({
  tone = 'info',
  theme = 'dark',
  title,
  children,
  action,
  className,
}: {
  tone?: AlertTone;
  theme?: 'dark' | 'light';
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const style = (theme === 'dark' ? DARK_TONES : LIGHT_TONES)[tone];
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
