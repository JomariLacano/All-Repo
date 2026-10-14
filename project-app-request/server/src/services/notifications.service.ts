import { v4 as uuidv4 } from 'uuid';
import { notificationsStore } from '../storage/stores';
import { AdminNotification, AdminNotificationType } from '../types';

export interface CreateNotificationInput {
  type: AdminNotificationType;
  requestId?: string | null;
  referenceNumber?: string | null;
  title: string;
  message: string;
  pingNumber?: number | null;
}

/** Creates and persists a new admin notification. Never throws on its own data errors. */
export async function createNotification(input: CreateNotificationInput): Promise<AdminNotification> {
  const notification: AdminNotification = {
    id: uuidv4(),
    type: input.type,
    requestId: input.requestId ?? null,
    referenceNumber: input.referenceNumber ?? null,
    title: input.title,
    message: input.message,
    pingNumber: input.pingNumber ?? null,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  await notificationsStore.update((file) => ({
    notifications: [notification, ...file.notifications],
  }));

  return notification;
}

export interface ListNotificationsOptions {
  type?: AdminNotificationType;
  isRead?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ListNotificationsResult {
  items: AdminNotification[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listNotifications(
  options: ListNotificationsOptions
): Promise<ListNotificationsResult> {
  const file = await notificationsStore.read();
  let items = [...file.notifications];

  if (options.type) {
    items = items.filter((n) => n.type === options.type);
  }
  if (options.isRead !== undefined) {
    items = items.filter((n) => n.isRead === options.isRead);
  }

  // Always newest first.
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = items.length;
  const pageSize = options.pageSize && options.pageSize > 0 ? options.pageSize : 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = options.page && options.page > 0 ? Math.min(options.page, totalPages) : 1;
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  return { items: paged, total, page, pageSize, totalPages };
}

export async function getUnreadCount(): Promise<number> {
  const file = await notificationsStore.read();
  return file.notifications.filter((n) => !n.isRead).length;
}

export async function markAsRead(id: string): Promise<AdminNotification | null> {
  let updated: AdminNotification | null = null;

  await notificationsStore.update((file) => {
    const notifications = file.notifications.map((n) => {
      if (n.id === id) {
        updated = { ...n, isRead: true };
        return updated;
      }
      return n;
    });
    return { notifications };
  });

  return updated;
}

export async function markAllAsRead(): Promise<number> {
  let changedCount = 0;

  await notificationsStore.update((file) => {
    const notifications = file.notifications.map((n) => {
      if (!n.isRead) {
        changedCount += 1;
        return { ...n, isRead: true };
      }
      return n;
    });
    return { notifications };
  });

  return changedCount;
}

export async function deleteNotification(id: string): Promise<boolean> {
  let deleted = false;

  await notificationsStore.update((file) => {
    const notifications = file.notifications.filter((n) => n.id !== id);
    deleted = notifications.length !== file.notifications.length;
    return { notifications };
  });

  return deleted;
}

/** Deletes all read notifications older than the given number of days. Returns the count removed. */
export async function clearOldNotifications(olderThanDays: number): Promise<number> {
  let removedCount = 0;
  const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

  await notificationsStore.update((file) => {
    const notifications = file.notifications.filter((n) => {
      const shouldRemove = n.isRead && new Date(n.createdAt).getTime() < cutoff;
      if (shouldRemove) removedCount += 1;
      return !shouldRemove;
    });
    return { notifications };
  });

  return removedCount;
}
