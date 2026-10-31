import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

/** Read-only star display. */
export function StarRating({
  value,
  size = 'sm',
  showValue = true,
  theme = 'dark',
  className,
}: {
  value: number | null | undefined;
  size?: 'xs' | 'sm' | 'md';
  showValue?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
}) {
  const rating = value ?? 0;
  const starClass =
    size === 'xs' ? 'h-3.5 w-3.5' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starClass,
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : theme === 'dark'
                  ? 'text-white/20'
                  : 'text-ink-300',
            )}
          />
        ))}
      </span>
      {showValue ? (
        <span
          className={cn(
            'font-semibold',
            theme === 'dark' ? 'text-white' : 'text-ink-800',
            size === 'xs' ? 'text-xs' : 'text-sm',
          )}
        >
          {rating > 0 ? rating.toFixed(1) : 'New'}
        </span>
      ) : null}
      <span className="sr-only">
        {rating > 0 ? `Rated ${rating.toFixed(1)} out of 5` : 'Not yet rated'}
      </span>
    </span>
  );
}

/** Interactive 1-5 star input. */
export function StarInput({
  value,
  onChange,
  error,
  name = 'rating',
  disabled = false,
  theme = 'dark',
}: {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  name?: string;
  disabled?: boolean;
  theme?: 'dark' | 'light';
}) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Rating out of 5 stars"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className="inline-flex items-center gap-1"
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault();
            onChange(Math.min(5, value + 1));
          }
          if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault();
            onChange(Math.max(1, value - 1));
          }
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= value;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={star === value}
              aria-label={`${star} star${star === 1 ? '' : 's'}`}
              disabled={disabled}
              onClick={() => onChange(star)}
              onMouseEnter={() => !disabled && onChange(star)}
              className={cn(
                'rounded p-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
                disabled ? 'cursor-not-allowed opacity-60' : 'hover:scale-110',
              )}
            >
              <Star
                className={cn(
                  'h-7 w-7 transition',
                  active
                    ? 'fill-amber-400 text-amber-400'
                    : theme === 'dark'
                      ? 'text-white/20'
                      : 'text-ink-300',
                )}
                aria-hidden="true"
              />
            </button>
          );
        })}
        <span
          className={cn(
            'ml-2 text-sm font-medium',
            theme === 'dark' ? 'text-white/55' : 'text-ink-600',
          )}
        >
          {value > 0 ? `${value} / 5` : 'Select a rating'}
        </span>
      </div>
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
