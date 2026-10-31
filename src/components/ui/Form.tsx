import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { AlertCircle, ChevronDown, Eye, EyeOff } from 'lucide-react';
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
  'block w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition duration-200 ' +
  'focus:outline-none focus:ring-2 disabled:cursor-not-allowed';

const inputTheme = (dark: boolean, error?: string) => {
  if (dark) {
    return cn(
      'text-white placeholder:text-white/30 scheme-dark',
      error
        ? 'border-red-500/60 bg-red-500/5 focus:border-red-400 focus:ring-red-500/20'
        : 'border-[rgba(21,88,201,0.45)] bg-[rgba(21,88,201,0.08)] focus:border-[#1558C9] focus:ring-[rgba(21,88,201,0.25)] focus:bg-[rgba(21,88,201,0.12)]',
      'disabled:opacity-40',
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
  disabled,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
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
        <select
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, hint, error)}
          className={cn(
            inputBase,
            inputTheme(dark, error),
            'appearance-none pr-10 cursor-pointer',
            disabled && 'cursor-not-allowed',
            className,
          )}
          {...rest}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}
              style={{ background: '#0d1526', color: dark ? '#fff' : '#0d1526' }}
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className={cn(
            'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors',
            disabled ? 'text-white/20' : error ? 'text-red-400' : 'text-[#1558C9]',
          )}
          aria-hidden="true"
        />
      </div>
    </Field>
  );
}
