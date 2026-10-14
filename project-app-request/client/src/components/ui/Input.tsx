import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', required, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : 'border-slate-300 dark:border-slate-700'
          } ${className}`}
          {...rest}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
