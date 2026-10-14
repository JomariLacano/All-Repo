import { config } from '../config';

export function formatCurrencyPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Formats an ISO UTC timestamp for display using the app's configured timezone. */
export function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: config.appTimezone,
  });
}
