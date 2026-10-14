import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, id, required, className = '', ...rest }, ref) => {
    const selectId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-slate-900 dark:text-slate-100 ${
            error ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'
          } ${className}`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
