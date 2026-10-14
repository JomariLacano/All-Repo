import { ReactNode } from 'react';
import { Inbox, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: ReactNode;
}

export function EmptyState({ title, message, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="rounded-full bg-slate-100 p-3 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        {icon ?? <Inbox size={24} />}
      </div>
      <p className="font-medium text-slate-700 dark:text-slate-200">{title}</p>
      {message && <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>}
    </div>
  );
}

export function ErrorState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="rounded-full bg-red-100 p-3 text-red-500 dark:bg-red-900/40 dark:text-red-400">
        <AlertCircle size={24} />
      </div>
      <p className="font-medium text-slate-700 dark:text-slate-200">{title}</p>
      {message && <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>}
    </div>
  );
}
