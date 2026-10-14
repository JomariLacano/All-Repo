import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
  showCounter?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, required, maxLength, showCounter, value, className = '', ...rest }, ref) => {
    const textareaId = id ?? rest.name;
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          maxLength={maxLength}
          value={value}
          aria-invalid={Boolean(error)}
          className={`w-full resize-y rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : 'border-slate-300 dark:border-slate-700'
          } ${className}`}
          {...rest}
        />
        <div className="flex items-center justify-between">
          <div>
            {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
            {error && <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
          </div>
          {showCounter && maxLength && (
            <p className="shrink-0 text-xs text-slate-400">
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
