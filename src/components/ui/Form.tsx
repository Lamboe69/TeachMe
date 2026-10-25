import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

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
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-800">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
        {optional ? <span className="ml-1 font-normal text-ink-400">(optional)</span> : null}
      </label>
      {hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="flex items-start gap-1.5 text-sm text-red-600">
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

/* ------------------------------------------------------------------ *
 * Input
 * ------------------------------------------------------------------ */

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  containerClassName?: string;
}

export function Input({
  id,
  label,
  hint,
  error,
  optional,
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
      className={containerClassName}
    >
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, hint, error)}
        className={cn(
          'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 shadow-sm transition',
          'placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100',
          'disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-500',
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-ink-300',
          className,
        )}
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
  containerClassName,
  className,
  required,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <Field
      label={label}
      htmlFor={inputId}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      className={containerClassName}
    >
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, hint, error)}
          className={cn(
            'block w-full rounded-xl border bg-white py-2.5 pl-3.5 pr-11 text-sm text-ink-900 shadow-sm transition',
            'placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100',
            'disabled:cursor-not-allowed disabled:bg-ink-100',
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-ink-300',
            className,
          )}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-ink-500 transition hover:text-ink-800"
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
  containerClassName?: string;
}

export function Textarea({
  id,
  label,
  hint,
  error,
  optional,
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
      className={containerClassName}
    >
      <textarea
        id={inputId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, hint, error)}
        className={cn(
          'block w-full resize-y rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 shadow-sm transition',
          'placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100',
          'disabled:cursor-not-allowed disabled:bg-ink-100',
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-ink-300',
          className,
        )}
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
  options,
  placeholder,
  containerClassName,
  className,
  required,
  ...rest
}: SelectProps) {
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
      className={containerClassName}
    >
      <select
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, hint, error)}
        className={cn(
          'block w-full appearance-none rounded-xl border bg-white bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat px-3.5 py-2.5 pr-10 text-sm text-ink-900 shadow-sm transition',
          'focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100',
          'disabled:cursor-not-allowed disabled:bg-ink-100',
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-ink-300',
          className,
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E\")",
        }}
        {...rest}
      >
        {placeholder ? (
          <option value="">{placeholder}</option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
