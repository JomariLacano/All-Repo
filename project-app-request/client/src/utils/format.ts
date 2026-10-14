export function formatCurrencyPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-PH', { month: 'short', year: 'numeric' });
}
