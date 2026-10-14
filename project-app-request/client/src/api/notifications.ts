import { apiClient } from './client';
import { AdminNotification, AdminNotificationType, PaginatedNotifications } from '../types';

export interface ListNotificationsParams {
  type?: AdminNotificationType | '';
  isRead?: boolean;
  page?: number;
  pageSize?: number;
}

export async function fetchNotifications(params: ListNotificationsParams): Promise<PaginatedNotifications> {
  const { data } = await apiClient.get<PaginatedNotifications>('/admin/notifications', { params });
  return data;
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>('/admin/notifications/unread-count');
  return data.count;
}

export async function markNotificationAsRead(id: string): Promise<AdminNotification> {
  const { data } = await apiClient.patch<{ notification: AdminNotification }>(
    `/admin/notifications/${id}/read`
  );
  return data.notification;
}

export async function markAllNotificationsAsRead(): Promise<number> {
  const { data } = await apiClient.patch<{ updatedCount: number }>('/admin/notifications/read-all');
  return data.updatedCount;
}

export async function deleteNotification(id: string): Promise<void> {
  await apiClient.delete(`/admin/notifications/${id}`);
}

export async function clearOldNotifications(olderThanDays = 30): Promise<number> {
  const { data } = await apiClient.delete<{ removedCount: number }>('/admin/notifications/clear-old', {
    params: { olderThanDays },
  });
  return data.removedCount;
}
