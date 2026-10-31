import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function Card({
  className,
  theme = 'dark',
  ...rest
}: HTMLAttributes<HTMLDivElement> & { theme?: 'dark' | 'light' }) {
  return (
    <div
      className={cn(
        // `min-w-0` lets the card shrink inside grids and flex rows, so long
        // words or truncated text can never push the layout wider than the
        // viewport on small screens.
        'min-w-0 rounded-card transition',
        theme === 'dark'
          ? 'border border-[rgba(21,88,201,0.25)] bg-[rgba(21,88,201,0.08)] text-white shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)]'
          : 'border border-ink-200/80 bg-white shadow-card',
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-b border-[rgba(21,88,201,0.2)] px-5 py-4', className)}
      {...rest}
    />
  );
}

export function CardTitle({
  className,
  as: As = 'h3',
  ...rest
}: HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' }) {
  return <As className={cn('text-base font-semibold text-white', className)} {...rest} />;
}

export function CardDescription({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-1 text-sm text-white/50', className)} {...rest} />;
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 border-t border-[rgba(21,88,201,0.2)] px-5 py-4',
        className,
      )}
      {...rest}
    />
  );
}

export function CardContent({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5', className)} {...rest} />;
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-white/50">{label}</p>
        {icon ? <span className="text-volt-400">{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-white/40">{hint}</p> : null}
    </Card>
  );
}
