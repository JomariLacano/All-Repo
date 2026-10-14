import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600 disabled:bg-brand-400',
  secondary:
    'bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
  outline:
    'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
  ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 disabled:bg-red-400',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-lg gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, disabled, className = '', children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
        {...rest}
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
