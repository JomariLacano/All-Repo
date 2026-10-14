import { Response } from 'express';
import {
  clearOldNotifications,
  deleteNotification,
  getUnreadCount,
  listNotifications,
  markAllAsRead,
  markAsRead,
} from '../services/notifications.service';
import { AdminNotificationType } from '../types';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const VALID_TYPES: AdminNotificationType[] = [
  'new_request',
  'request_ping',
  'request_status_changed',
  'telegram_notification_failed',
  'telegram_notification_retried',
];

/** GET /api/admin/notifications */
export async function getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { type, isRead, page, pageSize } = req.query;

  const result = await listNotifications({
    type: typeof type === 'string' && VALID_TYPES.includes(type as AdminNotificationType)
      ? (type as AdminNotificationType)
      : undefined,
    isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
  });

  res.status(200).json(result);
}

/** GET /api/admin/notifications/unread-count */
export async function getUnreadCountHandler(_req: AuthenticatedRequest, res: Response): Promise<void> {
  const count = await getUnreadCount();
  res.status(200).json({ count });
}

/** PATCH /api/admin/notifications/:id/read */
export async function markNotificationRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  const updated = await markAsRead(req.params.id);
  if (!updated) {
    res.status(404).json({ error: 'Notification not found.' });
    return;
  }
  res.status(200).json({ notification: updated });
}

/** PATCH /api/admin/notifications/read-all */
export async function markAllNotificationsRead(_req: AuthenticatedRequest, res: Response): Promise<void> {
  const count = await markAllAsRead();
  res.status(200).json({ updatedCount: count });
}

/** DELETE /api/admin/notifications/:id */
export async function removeNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
  const deleted = await deleteNotification(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Notification not found.' });
    return;
  }
  res.status(200).json({ message: 'Notification deleted.' });
}

/** DELETE /api/admin/notifications/clear-old?olderThanDays=30 */
export async function clearOldNotificationsHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const olderThanDays = req.query.olderThanDays ? Number(req.query.olderThanDays) : 30;
  const safeOlderThanDays = Number.isFinite(olderThanDays) && olderThanDays > 0 ? olderThanDays : 30;
  const removedCount = await clearOldNotifications(safeOlderThanDays);
  res.status(200).json({ removedCount });
}
