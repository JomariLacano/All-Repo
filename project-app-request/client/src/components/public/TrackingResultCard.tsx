import { ReactNode, useMemo, useState } from 'react';
import { Bell, CalendarClock, Mail, Phone, Wallet, Tag, Info, XCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressTracker } from './ProgressTracker';
import { PingConfirmModal } from './PingConfirmModal';
import { PublicTrackedRequest } from '../../types';
import { statusBadgeClasses } from '../../utils/statusHelpers';
import { formatCurrencyPHP, formatDate, formatDateTime } from '../../utils/format';

interface TrackingResultCardProps {
  request: PublicTrackedRequest;
  onSendPing: (message: string) => Promise<void>;
  isSendingPing: boolean;
  cooldownMessage: string | null;
}

export function TrackingResultCard({
  request,
  onSendPing,
  isSendingPing,
  cooldownMessage,
}: TrackingResultCardProps) {
  const [pingModalOpen, setPingModalOpen] = useState(false);

  const isClosed = request.status === 'Done' || request.status === 'Rejected';

  const cooldownInfo = useMemo(() => {
    if (!request.lastPingAt) return null;
    const nextAllowedAt = new Date(
      new Date(request.lastPingAt).getTime() + request.pingCooldownHours * 60 * 60 * 1000
    );
    const isActive = nextAllowedAt.getTime() > Date.now();
    return { nextAllowedAt, isActive };
  }, [request.lastPingAt, request.pingCooldownHours]);

  const pingDisabled = isClosed || Boolean(cooldownInfo?.isActive);

  const category =
    request.category === 'Other' && request.otherCategory
      ? `Other (${request.otherCategory})`
      : request.category;

  async function handleConfirmPing(message: string) {
    await onSendPing(message);
    setPingModalOpen(false);
  }

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Reference Number
          </p>
          <p className="font-mono text-lg font-semibold text-slate-900 dark:text-white">
            {request.referenceNumber}
          </p>
        </div>
        <Badge className={statusBadgeClasses(request.status)}>{request.status}</Badge>
      </div>

      {request.status === 'Rejected' ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
          <XCircle size={20} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              This request was rejected.
            </p>
            {request.publicRejectionReason && (
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {request.publicRejectionReason}
              </p>
            )}
          </div>
        </div>
      ) : (
        <ProgressTracker status={request.status} />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field icon={<Tag size={15} />} label="Project Title" value={request.projectTitle} />
        <Field icon={<Tag size={15} />} label="Category" value={category} />
        <Field
          icon={<Wallet size={15} />}
          label="Initial Proposed Amount"
          value={formatCurrencyPHP(request.initialProposedAmount)}
        />
        <Field
          icon={<Phone size={15} />}
          label="Preferred Contact Method"
          value={request.preferredContactMethod}
        />
        <Field icon={<CalendarClock size={15} />} label="Date Submitted" value={formatDate(request.createdAt)} />
        <Field icon={<CalendarClock size={15} />} label="Last Updated" value={formatDate(request.updatedAt)} />
      </div>

      {request.publicMessage && (
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-900/40 dark:bg-brand-900/10">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
            <Mail size={13} />
            Update from Jomari Lacano
          </p>
          <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-200">{request.publicMessage}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Bell size={14} />
          <span>
            Follow-ups sent: <strong className="text-slate-700 dark:text-slate-200">{request.pingCount}</strong>
          </span>
          {request.lastPingAt && <span>· Last follow-up: {formatDate(request.lastPingAt)}</span>}
        </div>

        {isClosed ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Follow-ups are no longer available because this request has already been {request.status.toLowerCase()}.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Use this button if you would like to follow up on your project request.
            </p>
            {cooldownInfo?.isActive && (
              <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                <Info size={14} className="mt-0.5 shrink-0" />
                You recently sent a follow-up. You may send another one after{' '}
                {formatDateTime(cooldownInfo.nextAllowedAt.toISOString())}.
              </p>
            )}
            {cooldownMessage && (
              <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                <Info size={14} className="mt-0.5 shrink-0" />
                {cooldownMessage}
              </p>
            )}
            <Button
              variant="outline"
              className="self-start"
              onClick={() => setPingModalOpen(true)}
              disabled={pingDisabled}
            >
              <Bell size={16} className="mr-1.5" />
              Send Follow-up
            </Button>
          </>
        )}
      </div>

      <PingConfirmModal
        isOpen={pingModalOpen}
        isSending={isSendingPing}
        onConfirm={handleConfirmPing}
        onCancel={() => setPingModalOpen(false)}
      />
    </Card>
  );
}

function Field({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">{value}</dd>
    </div>
  );
}
