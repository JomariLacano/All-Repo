import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, RefreshCw, Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PingHistoryEntry, ProjectRequest } from '../../types';
import { formatDateTime } from '../../utils/format';
import { formatOrdinal } from '../../utils/ordinal';
import { retryPingNotification } from '../../api/adminRequests';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';

interface PingHistoryTimelineProps {
  requestId: string;
  pingHistory: PingHistoryEntry[];
  onRetried: (updated: ProjectRequest) => void;
}

export function PingHistoryTimeline({ requestId, pingHistory, onRetried }: PingHistoryTimelineProps) {
  const { showToast } = useToast();
  const [retryingPingId, setRetryingPingId] = useState<string | null>(null);

  if (pingHistory.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No follow-ups have been sent for this request yet.
      </p>
    );
  }

  async function handleRetry(pingId: string) {
    setRetryingPingId(pingId);
    try {
      const { request } = await retryPingNotification(requestId, pingId);
      onRetried(request);
      const retriedPing = request.pingHistory.find((p) => p.id === pingId);
      if (retriedPing?.telegramNotificationStatus === 'sent') {
        showToast('Follow-up notification sent successfully.', 'success');
      } else {
        showToast('Follow-up notification failed again.', 'error');
      }
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to retry the notification.'), 'error');
    } finally {
      setRetryingPingId(null);
    }
  }

  // Newest first for admin review.
  const sorted = [...pingHistory].sort((a, b) => b.pingNumber - a.pingNumber);

  return (
    <ol className="relative flex flex-col gap-5 border-l-2 border-slate-200 pl-5 dark:border-slate-800">
      {sorted.map((ping) => (
        <li key={ping.id} className="relative">
          <span
            className={`absolute -left-[1.6rem] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 ${
              ping.pingNumber >= 3 ? 'bg-red-500' : ping.pingNumber === 2 ? 'bg-amber-500' : 'bg-blue-500'
            }`}
          >
            <Bell size={9} className="text-white" />
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {formatOrdinal(ping.pingNumber)} ping
            </span>
            <Badge
              className={
                ping.telegramNotificationStatus === 'sent'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : ping.telegramNotificationStatus === 'failed'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }
            >
              {ping.telegramNotificationStatus === 'sent' && <CheckCircle2 size={11} className="mr-1 inline" />}
              {ping.telegramNotificationStatus === 'failed' && <XCircle size={11} className="mr-1 inline" />}
              {ping.telegramNotificationStatus === 'pending' && <Clock size={11} className="mr-1 inline" />}
              {ping.telegramNotificationStatus}
            </Badge>
          </div>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {formatDateTime(ping.createdAt)}
          </p>

          {ping.message && (
            <p className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              "{ping.message}"
            </p>
          )}

          {ping.telegramNotificationStatus === 'failed' && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => handleRetry(ping.id)}
              isLoading={retryingPingId === ping.id}
            >
              <RefreshCw size={13} className="mr-1.5" />
              Retry Notification
            </Button>
          )}
        </li>
      ))}
    </ol>
  );
}
