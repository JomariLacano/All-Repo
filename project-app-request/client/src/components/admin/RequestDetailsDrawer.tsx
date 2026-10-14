import { useEffect, useState } from 'react';
import { RefreshCw, Trash2, CheckCircle2, XCircle, Clock, Bell } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { PingHistoryTimeline } from './PingHistoryTimeline';
import { ProjectRequest, RequestStatus } from '../../types';
import { formatCurrencyPHP, formatDateTime } from '../../utils/format';
import { STATUS_OPTIONS } from '../../utils/statusHelpers';
import { updateAdminRequest, deleteAdminRequest, retryNotification } from '../../api/adminRequests';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';

interface RequestDetailsDrawerProps {
  request: ProjectRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updated: ProjectRequest) => void;
  onDeleted: (id: string) => void;
}

export function RequestDetailsDrawer({
  request,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
}: RequestDetailsDrawerProps) {
  const { showToast } = useToast();
  const [status, setStatus] = useState<RequestStatus>('Pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [publicMessage, setPublicMessage] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (request) {
      setStatus(request.status);
      setAdminNotes(request.adminNotes);
      setPublicMessage(request.publicMessage);
      setAmountPaid(request.amountPaid ? String(request.amountPaid) : '');
      setRejectionReason(request.rejectionReason ?? '');
      setFormError(null);
    }
  }, [request]);

  if (!request) return null;

  async function handleSave() {
    setFormError(null);

    if (status === 'Done') {
      const parsed = Number(amountPaid);
      if (amountPaid.trim() === '' || Number.isNaN(parsed) || parsed < 0) {
        setFormError('Amount paid is required and must be zero or greater when marking as Done.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const { request: updated } = await updateAdminRequest(request!.id, {
        status,
        adminNotes,
        publicMessage,
        amountPaid: status === 'Done' ? Number(amountPaid) : undefined,
        rejectionReason: status === 'Rejected' ? rejectionReason || null : null,
      });
      onUpdated(updated);
      showToast('Request updated successfully.', 'success');
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to update the request.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRetryNotification() {
    setIsRetrying(true);
    try {
      const { request: updated } = await retryNotification(request!.id);
      onUpdated(updated);
      if (updated.notificationStatus === 'sent') {
        showToast('Telegram notification sent successfully.', 'success');
      } else {
        showToast('Telegram notification failed again. Please check the bot configuration.', 'error');
      }
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to retry notification.'), 'error');
    } finally {
      setIsRetrying(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteAdminRequest(request!.id);
      showToast('Request deleted.', 'success');
      setConfirmDeleteOpen(false);
      onDeleted(request!.id);
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to delete the request.'), 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  const category =
    request.category === 'Other' && request.otherCategory
      ? `Other (${request.otherCategory})`
      : request.category;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Request ${request.referenceNumber}`}
        size="lg"
        footer={
          <>
            <Button
              variant="danger"
              onClick={() => setConfirmDeleteOpen(true)}
              className="sm:mr-auto"
            >
              <Trash2 size={16} className="mr-1.5" />
              Delete
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-6">
          {request.pingCount > 0 && (
            <div
              className={`flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                request.pingCount >= 3
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                  : request.pingCount === 2
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
              }`}
            >
              <Bell size={14} />
              {request.pingCount} follow-up{request.pingCount === 1 ? '' : 's'} received
              {request.lastPingAt && <span>· Last: {formatDateTime(request.lastPingAt)}</span>}
            </div>
          )}

          {/* Client info */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Client Information
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Full Name" value={request.fullName} />
              <Field label="Email" value={request.email} />
              <Field label="Contact Number" value={request.contactNumber} />
              <Field label="Preferred Contact Method" value={request.preferredContactMethod} />
            </dl>
          </section>

          {/* Project info */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Project Details
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Project Title" value={request.projectTitle} />
              <Field label="Category" value={category} />
              <Field label="Initial Proposed Amount" value={formatCurrencyPHP(request.initialProposedAmount)} />
              <Field label="Amount Paid" value={formatCurrencyPHP(request.amountPaid)} />
            </dl>
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Description</p>
              <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {request.description}
              </p>
            </div>
          </section>

          {/* Notification status */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Telegram Notification
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                className={
                  request.notificationStatus === 'sent'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : request.notificationStatus === 'failed'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }
              >
                {request.notificationStatus === 'sent' && <CheckCircle2 size={12} className="mr-1 inline" />}
                {request.notificationStatus === 'failed' && <XCircle size={12} className="mr-1 inline" />}
                {request.notificationStatus === 'pending' && <Clock size={12} className="mr-1 inline" />}
                {request.notificationStatus}
              </Badge>
              {request.notificationStatus === 'failed' && (
                <Button variant="outline" size="sm" onClick={handleRetryNotification} isLoading={isRetrying}>
                  <RefreshCw size={14} className="mr-1.5" />
                  Retry Notification
                </Button>
              )}
            </div>
          </section>

          {/* Follow-up / ping history */}
          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Bell size={13} />
              Follow-up History ({request.pingCount})
            </h3>
            <PingHistoryTimeline
              requestId={request.id}
              pingHistory={request.pingHistory}
              onRetried={onUpdated}
            />
          </section>

          {/* Admin actions */}
          <section className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Manage Request
            </h3>

            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as RequestStatus)}
              options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
            />

            {status === 'Done' && (
              <Input
                label="Amount Paid (PHP)"
                required
                type="number"
                min={0}
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            )}

            {status === 'Rejected' && (
              <Textarea
                label="Rejection Reason (optional)"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            )}

            <Textarea
              label="Public Update Message"
              rows={3}
              value={publicMessage}
              onChange={(e) => setPublicMessage(e.target.value)}
              maxLength={2000}
              showCounter
              hint="Shown to the client on the public tracking page. Keep it client-appropriate."
            />

            <Textarea
              label="Admin Notes"
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              maxLength={5000}
            />

            {formError && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300">
                {formError}
              </div>
            )}
          </section>

          {/* Timestamps */}
          <section className="grid grid-cols-1 gap-3 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
            <p>Created: {formatDateTime(request.createdAt)}</p>
            <p>Last Updated: {formatDateTime(request.updatedAt)}</p>
          </section>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        title="Delete Request"
        message={`Are you sure you want to permanently delete request ${request.referenceNumber}? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-sm text-slate-900 dark:text-slate-100">{value}</dd>
    </div>
  );
}
