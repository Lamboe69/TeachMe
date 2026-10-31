import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

const LIGHT_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:hover:bg-green-600',
  secondary:
    'bg-green-50 text-green-800 hover:bg-green-100 active:bg-green-200 disabled:hover:bg-green-50',
  outline:
    'border border-green-200 bg-white text-green-800 hover:border-green-300 hover:bg-green-50 disabled:hover:bg-white',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200 disabled:hover:bg-transparent',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:hover:bg-red-600',
  success:
    'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 disabled:hover:bg-accent-600',
};

const DARK_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-volt-400 text-night-950 shadow-[0_8px_24px_-10px_rgba(212,255,36,0.65)] hover:bg-volt-300 active:bg-volt-500 disabled:hover:bg-volt-400',
  secondary:
    'bg-[rgba(21,88,201,0.3)] text-white hover:bg-[rgba(21,88,201,0.45)] active:bg-[rgba(21,88,201,0.55)]',
  outline:
    'border border-[rgba(21,88,201,0.5)] bg-transparent text-white/80 hover:border-cobalt-400 hover:bg-[rgba(21,88,201,0.16)] hover:text-white',
  ghost: 'bg-transparent text-white/60 hover:bg-white/5 hover:text-white',
  danger:
    'bg-red-500/90 text-white hover:bg-red-500 active:bg-red-600 disabled:hover:bg-red-500/90',
  success:
    'bg-volt-400 text-night-950 shadow-[0_8px_24px_-10px_rgba(212,255,36,0.65)] hover:bg-volt-300 active:bg-volt-500 disabled:hover:bg-volt-400',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 rounded-lg px-3 text-sm',
  md: 'h-11 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-6 text-base',
};

const BASE =
  'inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition-all duration-200 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-55 active:scale-[0.98]';

const FOCUS: Record<'dark' | 'light', string> = {
  dark: 'focus-visible:outline-volt-400',
  light: 'focus-visible:outline-brand-600',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  theme?: 'dark' | 'light';
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    theme = 'dark',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className,
    disabled,
    type = 'button',
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        BASE,
        FOCUS[theme],
        (theme === 'dark' ? DARK_VARIANTS : LIGHT_VARIANTS)[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : LeftIcon ? (
        <LeftIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : null}
      {children}
      {loading ? null : RightIcon ? (
        <RightIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : null}
    </button>
  );
});

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  theme?: 'dark' | 'light';
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children?: ReactNode;
}

/** A react-router link that looks like a button. */
export function ButtonLink({
  variant = 'primary',
  theme = 'dark',
  size = 'md',
  fullWidth = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        BASE,
        FOCUS[theme],
        (theme === 'dark' ? DARK_VARIANTS : LIGHT_VARIANTS)[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {LeftIcon ? <LeftIcon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      {children}
      {RightIcon ? <RightIcon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
    </Link>
  );
}
