import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section';
}

export function Card({ children, className = '', as = 'div' }: CardProps) {
  const Component = as;
  return (
    <Component
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </Component>
  );
}
