import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ChevronLeft, ChevronRight, Trash2, Eraser } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import {
  clearOldNotifications,
  deleteNotification,
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../api/notifications';
import { AdminNotification, AdminNotificationType } from '../../types';
import { getErrorMessage } from '../../api/client';
import { formatDateTime, formatRelativeTime } from '../../utils/format';
import { NOTIFICATION_TYPE_LABELS, notificationTypeAccent } from '../../utils/notificationHelpers';
import { useToast } from '../../hooks/useToast';

const PAGE_SIZE = 15;

const TYPE_OPTIONS: { value: AdminNotificationType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  ...(Object.keys(NOTIFICATION_TYPE_LABELS) as AdminNotificationType[]).map((type) => ({
    value: type,
    label: NOTIFICATION_TYPE_LABELS[type],
  })),
];

export function NotificationsPage() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [typeFilter, setTypeFilter] = useState<AdminNotificationType | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchNotifications({
        type: typeFilter || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(result.items);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load notifications.'));
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter]);

  async function handleItemClick(notification: AdminNotification) {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setItems((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
      } catch {
        // Non-critical.
      }
    }
    if (notification.requestId) {
      navigate(`/admin/requests?open=${notification.requestId}`);
    }
  }

  async function handleMarkAllRead() {
    try {
      const count = await markAllNotificationsAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast(`Marked ${count} notification${count === 1 ? '' : 's'} as read.`, 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to mark notifications as read.'), 'error');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteNotification(id);
      setItems((prev) => prev.filter((n) => n.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to delete notification.'), 'error');
    }
  }

  async function handleClearOld() {
    setIsClearing(true);
    try {
      const removedCount = await clearOldNotifications(30);
      showToast(`Cleared ${removedCount} old notification${removedCount === 1 ? '' : 's'}.`, 'success');
      setConfirmClearOpen(false);
      void load();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to clear old notifications.'), 'error');
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {total} notification{total === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck size={14} className="mr-1.5" />
            Mark all read
          </Button>
          <Button variant="outline" size="sm" onClick={() => setConfirmClearOpen(true)}>
            <Eraser size={14} className="mr-1.5" />
            Clear old
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as AdminNotificationType | '')}
          options={TYPE_OPTIONS}
        />
      </Card>

      {isLoading && (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <Card>
          <ErrorState title="Could not load notifications" message={error} />
        </Card>
      )}

      {!isLoading && !error && items.length === 0 && (
        <Card>
          <EmptyState
            icon={<Bell size={24} />}
            title="No notifications"
            message="You're all caught up."
          />
        </Card>
      )}

      {!isLoading && !error && items.length > 0 && (
        <Card className="divide-y divide-slate-200 p-0 dark:divide-slate-800">
          {items.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${
                !notification.isRead ? 'bg-brand-50/40 dark:bg-brand-900/10' : ''
              }`}
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notificationTypeAccent(notification)}`}
              />
              <button
                type="button"
                onClick={() => handleItemClick(notification)}
                className="flex-1 text-left"
                disabled={!notification.requestId}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {notification.title}
                  </span>
                  <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {NOTIFICATION_TYPE_LABELS[notification.type]}
                  </Badge>
                  {!notification.isRead && (
                    <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                      Unread
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{notification.message}</p>
                <p className="mt-1 text-xs text-slate-400" title={formatDateTime(notification.createdAt)}>
                  {formatRelativeTime(notification.createdAt)} · {formatDateTime(notification.createdAt)}
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(notification.id)}
                aria-label="Delete notification"
                className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </Card>
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmClearOpen}
        title="Clear Old Notifications"
        message="This will permanently delete all read notifications older than 30 days. This cannot be undone."
        confirmLabel="Clear Old"
        isDanger
        isLoading={isClearing}
        onConfirm={handleClearOld}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
}
