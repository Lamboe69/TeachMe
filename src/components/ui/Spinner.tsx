import { cn } from '@/utils/cn';

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-live="polite" className={cn('inline-flex items-center gap-2', className)}>
      <svg
        className="h-5 w-5 animate-spin text-brand-700"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      {label ? <span className="text-sm text-ink-600">{label}</span> : null}
      <span className="sr-only">Loading</span>
    </span>
  );
}

/** Full-page / section loading state. */
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <Spinner />
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  );
}

/** Placeholder block used while content loads. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-ink-200/70', className)} aria-hidden="true" />;
}

/** Full-screen loader used while a page chunk is being downloaded. */
export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50">
      <Spinner className="h-8 w-8" />
      <span className="sr-only">Loading the page…</span>
    </div>
  );
}
