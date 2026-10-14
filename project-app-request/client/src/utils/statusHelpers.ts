import { RequestStatus } from '../types';

export const STATUS_OPTIONS: RequestStatus[] = ['Pending', 'Reviewing', 'In Progress', 'Done', 'Rejected'];

export const CATEGORY_OPTIONS = [
  'Web Application',
  'Documentation',
  'Bug Fixing',
  'Add a Feature',
  'Other',
] as const;

export function statusBadgeClasses(status: RequestStatus): string {
  switch (status) {
    case 'Pending':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    case 'Reviewing':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    case 'Done':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'Rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}
