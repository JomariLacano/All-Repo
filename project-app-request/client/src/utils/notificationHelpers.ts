import { AdminNotification, AdminNotificationType } from '../types';

/** Maps a notification's type/ping-number to a Tailwind background color for a small accent dot. */
export function notificationTypeAccent(notification: AdminNotification): string {
  if (notification.type === 'request_ping') {
    const pingNumber = notification.pingNumber ?? 1;
    if (pingNumber >= 3) return 'bg-red-500';
    if (pingNumber === 2) return 'bg-amber-500';
    return 'bg-blue-500';
  }

  switch (notification.type) {
    case 'new_request':
      return 'bg-emerald-500';
    case 'request_status_changed':
      return 'bg-brand-500';
    case 'telegram_notification_failed':
      return 'bg-red-500';
    case 'telegram_notification_retried':
      return 'bg-slate-400';
    default:
      return 'bg-slate-400';
  }
}

export const NOTIFICATION_TYPE_LABELS: Record<AdminNotificationType, string> = {
  new_request: 'New Project Request',
  request_ping: 'Client Follow-up',
  request_status_changed: 'Request Status Changed',
  telegram_notification_failed: 'Telegram Notification Failed',
  telegram_notification_retried: 'Telegram Notification Retried',
};
