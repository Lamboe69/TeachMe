import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

type Theme = 'dark' | 'light';

/* ------------------------------------------------------------------ *
 * Field wrapper
 * ------------------------------------------------------------------ */

export interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  theme?: Theme;
  children: ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  optional,
  theme = 'dark',
  children,
  className,
}: FieldProps) {
  const dark = theme === 'dark';
  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className={cn('block text-sm font-medium', dark ? 'text-white/80' : 'text-ink-800')}
      >
        {label}
        {required ? (
          <span className={cn('ml-0.5', dark ? 'text-red-300' : 'text-red-600')} aria-hidden="true">
            *
          </span>
        ) : null}
        {optional ? (
          <span className={cn('ml-1 font-normal', dark ? 'text-white/30' : 'text-ink-400')}>
            (optional)
          </span>
        ) : null}
      </label>
      {hint ? (
        <p id={`${htmlFor}-hint`} className={cn('text-xs', dark ? 'text-white/40' : 'text-ink-500')}>
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          className={cn('flex items-start gap-1.5 text-sm', dark ? 'text-red-300' : 'text-red-600')}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

const inputBase =
  'block w-full rounded-xl border px-3.5 py-2.5 text-sm shadow-sm transition duration-200 ' +
  'focus:outline-none focus:ring-4 disabled:cursor-not-allowed';

const inputTheme = (dark: boolean, error?: string) => {
  if (dark) {
    return cn(
      'bg-white/[0.05] text-white placeholder:text-white/25 scheme-dark',
      error
        ? 'border-red-500/60 focus:border-red-400 focus:ring-red-500/15'
        : 'border-[rgba(21,88,201,0.4)] focus:border-cobalt-400 focus:ring-cobalt-500/25',
      'disabled:bg-white/[0.03] disabled:text-white/35',
    );
  }
  return cn(
    'bg-white text-ink-900 placeholder:text-ink-400',
    error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
      : 'border-ink-300 focus:border-brand-500 focus:ring-brand-100',
    'disabled:bg-ink-100 disabled:text-ink-500',
  );
};

/* ------------------------------------------------------------------ *
 * Input
 * ------------------------------------------------------------------ */

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  theme?: Theme;
  containerClassName?: string;
}

export function Input({
  id,
  label,
  hint,
  error,
  optional,
  theme = 'dark',
  containerClassName,
  className,
  required,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <Field
      label={label}
      htmlFor={inputId}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      theme={theme}
      className={containerClassName}
    >
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, hint, error)}
        className={cn(inputBase, inputTheme(theme === 'dark', error), className)}
        {...rest}
      />
    </Field>
  );
}

/* ------------------------------------------------------------------ *
 * Password input with show / hide
 * ------------------------------------------------------------------ */

export function PasswordInput({
  id,
  label,
  hint,
  error,
  optional,
  theme = 'dark',
  containerClassName,
  className,
  required,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  const dark = theme === 'dark';

  return (
    <Field
      label={label}
      htmlFor={inputId}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      theme={theme}
      className={containerClassName}
    >
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, hint, error)}
          className={cn(inputBase, inputTheme(dark, error), 'pr-11', className)}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className={cn(
            'absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl transition',
            dark ? 'text-white/40 hover:text-white' : 'text-ink-500 hover:text-ink-800',
          )}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff className="h-4.5 w-4.5" aria-hidden="true" />
          ) : (
            <Eye className="h-4.5 w-4.5" aria-hidden="true" />
          )}
        </button>
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------------ *
 * Textarea
 * ------------------------------------------------------------------ */

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  theme?: Theme;
  containerClassName?: string;
}

export function Textarea({
  id,
  label,
  hint,
  error,
  optional,
  theme = 'dark',
  containerClassName,
  className,
  required,
  rows = 4,
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <Field
      label={label}
      htmlFor={inputId}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      theme={theme}
      className={containerClassName}
    >
      <textarea
        id={inputId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, hint, error)}
        className={cn(inputBase, inputTheme(theme === 'dark', error), 'resize-y', className)}
        {...rest}
      />
    </Field>
  );
}

/* ------------------------------------------------------------------ *
 * Select
 * ------------------------------------------------------------------ */

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  theme?: Theme;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

export function Select({
  id,
  label,
  hint,
  error,
  optional,
  theme = 'dark',
  options,
  placeholder,
  containerClassName,
  className,
  required,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const dark = theme === 'dark';
  const arrowColor = dark ? '%23c7d6ef' : '%2364748b';

  return (
    <Field
      label={label}
      htmlFor={inputId}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      theme={theme}
      className={containerClassName}
    >
      <select
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, hint, error)}
        className={cn(
          inputBase,
          inputTheme(dark, error),
          'appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10',
          className,
        )}
        style={{
          backgroundColor: dark ? '#0d1526' : undefined,
          backgroundImage:
            `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='${arrowColor}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
        }}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
