export function formatCurrencyPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Manila',
  });
}
