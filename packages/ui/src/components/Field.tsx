'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { AlertIcon, ChevronDownIcon } from '@segevision/icons';

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'id'> {
  label: React.ReactNode;
  /** Helper copy shown under the label — use for format expectations, not for warnings. */
  hint?: React.ReactNode;
  /** Presence of an error switches the control to its invalid state and announces it. */
  error?: React.ReactNode;
  required?: boolean;
  /** Supply when the control is rendered outside this Field (rare). */
  htmlFor?: string;
}

/**
 * Wires a label, hint and error message to whatever control it wraps: matching
 * `id`/`htmlFor`, `aria-describedby` for the hint, `aria-invalid` + `role="alert"`
 * for the error. Controls never have to repeat that plumbing.
 */
export function Field({ label, hint, error, required = false, htmlFor, className, children, ...props }: FieldProps) {
  const reactId = React.useId();
  const id = htmlFor ?? `field-${reactId}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const ctx = React.useMemo<FieldContextValue>(
    () => ({ id, describedBy, invalid: Boolean(error), required }),
    [id, describedBy, error, required],
  );

  return (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      <label htmlFor={id} className="font-body text-sm font-semibold text-text-primary">
        {label}
        {required && (
          <span className="ms-1 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <FieldContext.Provider value={ctx}>{children}</FieldContext.Provider>
      {/* Hint sits under the control, not under the label: otherwise two fields side
          by side in a row would have their inputs at different heights whenever only
          one of them carries a hint. */}
      {hint && (
        <span id={hintId} className="font-body text-xs text-text-secondary">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} role="alert" className="inline-flex items-center gap-1.5 font-body text-xs text-danger">
          <AlertIcon size={16} aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
}

const controlClasses = [
  'w-full rounded-md border bg-surface px-4 font-body text-base text-text-primary',
  'placeholder:text-text-secondary/60',
  'transition-[border-color,box-shadow] duration-fast ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
  'disabled:cursor-not-allowed disabled:opacity-60',
];

function useFieldProps(explicit: { id?: string; 'aria-describedby'?: string; required?: boolean }) {
  const ctx = React.useContext(FieldContext);
  return {
    id: explicit.id ?? ctx?.id,
    'aria-describedby': explicit['aria-describedby'] ?? ctx?.describedBy,
    'aria-invalid': ctx?.invalid || undefined,
    required: explicit.required ?? ctx?.required,
    invalid: Boolean(ctx?.invalid),
  };
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  const { invalid, ...field } = useFieldProps(props);
  return (
    <input
      ref={ref}
      {...props}
      {...field}
      className={cn(controlClasses, 'h-12', invalid ? 'border-danger' : 'border-border hover:border-text-secondary/40', className)}
    />
  );
});
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, rows = 4, ...props }, ref) => {
  const { invalid, ...field } = useFieldProps(props);
  return (
    <textarea
      ref={ref}
      rows={rows}
      {...props}
      {...field}
      className={cn(controlClasses, 'resize-y py-3 leading-relaxed', invalid ? 'border-danger' : 'border-border hover:border-text-secondary/40', className)}
    />
  );
});
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

/**
 * Native <select> on purpose: on mobile it opens the platform picker, which is
 * faster and more accessible than any custom listbox we would ship here.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => {
  const { invalid, ...field } = useFieldProps(props);
  return (
    <div className="relative">
      <select
        ref={ref}
        {...props}
        {...field}
        className={cn(
          controlClasses,
          'h-12 appearance-none pe-11',
          invalid ? 'border-danger' : 'border-border hover:border-text-secondary/40',
          className,
        )}
      >
        {children}
      </select>
      <ChevronDownIcon
        size={20}
        aria-hidden="true"
        className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-text-secondary"
      />
    </div>
  );
});
Select.displayName = 'Select';
