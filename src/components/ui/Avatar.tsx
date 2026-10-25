import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/format';

const SIZES = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

export function Avatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const dimension = SIZES[size];

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn('shrink-0 rounded-full object-cover ring-1 ring-ink-200', dimension, className)}
        loading="lazy"
      />
    );
  }

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-brand-800 ring-1 ring-brand-200',
        dimension,
        className,
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
