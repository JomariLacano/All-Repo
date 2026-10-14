import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../api/notifications';
import { AdminNotification } from '../../types';
import { formatRelativeTime } from '../../utils/format';
import { notificationTypeAccent } from '../../utils/notificationHelpers';

const POLL_INTERVAL_MS = 30_000;
const PREVIEW_COUNT = 8;

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await fetchUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // Silently ignore; the bell simply won't update this cycle.
    }
  }, []);

  useEffect(() => {
    void refreshUnreadCount();
    const interval = setInterval(() => void refreshUnreadCount(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  async function handleOpen() {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      setIsLoading(true);
      try {
        const result = await fetchNotifications({ page: 1, pageSize: PREVIEW_COUNT });
        setItems(result.items);
      } finally {
        setIsLoading(false);
      }
    }
  }

  async function handleItemClick(notification: AdminNotification) {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setItems((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Non-critical; the notification will still navigate.
      }
    }
    setIsOpen(false);
    if (notification.requestId) {
      navigate(`/admin/requests?open=${notification.requestId}`);
    } else {
      navigate('/admin/notifications');
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore; user can retry.
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[min(90vw,22rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {isLoading && (
              <p className="px-4 py-6 text-center text-sm text-slate-400">Loading…</p>
            )}
            {!isLoading && items.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-400">No notifications yet.</p>
            )}
            {!isLoading &&
              items.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleItemClick(notification)}
                  className={`flex w-full flex-col gap-0.5 border-b border-slate-100 px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 ${
                    !notification.isRead ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${notificationTypeAccent(notification)}`} />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {notification.title}
                    </span>
                    {!notification.isRead && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    )}
                  </span>
                  <span className="pl-3.5 text-xs text-slate-600 dark:text-slate-300">
                    {notification.message}
                  </span>
                  <span className="pl-3.5 text-[11px] text-slate-400">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </button>
              ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              navigate('/admin/notifications');
            }}
            className="flex w-full items-center justify-center gap-1.5 border-t border-slate-200 px-4 py-2.5 text-xs font-semibold text-brand-600 hover:bg-slate-50 dark:border-slate-800 dark:text-brand-400 dark:hover:bg-slate-800/60"
          >
            View all notifications
            <ExternalLink size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
