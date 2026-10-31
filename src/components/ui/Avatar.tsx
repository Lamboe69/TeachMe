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
  theme = 'dark',
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  theme?: 'dark' | 'light';
  className?: string;
}) {
  const dark = theme === 'dark';
  const dimension = SIZES[size];

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn(
          'shrink-0 rounded-full object-cover ring-1',
          dark ? 'ring-[rgba(21,88,201,0.5)]' : 'ring-ink-200',
          dimension,
          className,
        )}
        loading="lazy"
      />
    );
  }

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-bold ring-1',
        dark
          ? 'bg-cobalt-500 text-volt-400 ring-[rgba(21,88,201,0.5)]'
          : 'bg-brand-100 text-brand-800 ring-brand-200',
        dimension,
        className,
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
