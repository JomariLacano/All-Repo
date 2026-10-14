import { v4 as uuidv4 } from 'uuid';
import { requestsStore } from '../storage/stores';
import { generateReferenceNumber } from './referenceNumber.service';
import { sendTelegramNotification, sendTelegramPingNotification } from './telegram.service';
import { createNotification } from './notifications.service';
import { config } from '../config';
import { formatOrdinal } from '../utils/ordinal';
import {
  ContactMethod,
  PingHistoryEntry,
  ProjectRequest,
  PublicTrackedRequest,
  RequestCategory,
  RequestStatus,
} from '../types';
import { logger } from '../utils/logger';

/**
 * Backfills fields that may be missing from requests persisted before the
 * ping/public-message features were added, so older `requests.json` data
 * keeps working without a manual migration step.
 */
function normalizeRequest(raw: ProjectRequest): ProjectRequest {
  return {
    ...raw,
    publicMessage: raw.publicMessage ?? '',
    pingCount: raw.pingCount ?? 0,
    lastPingAt: raw.lastPingAt ?? null,
    pingHistory: raw.pingHistory ?? [],
  };
}

export interface CreateRequestInput {
  fullName: string;
  email: string;
  contactNumber: string;
  preferredContactMethod: ContactMethod;
  projectTitle: string;
  description: string;
  initialProposedAmount: number;
  category: RequestCategory;
  otherCategory: string | null;
}

export async function createRequest(input: CreateRequestInput): Promise<ProjectRequest> {
  const now = new Date().toISOString();
  let created!: ProjectRequest;

  await requestsStore.update((file) => {
    const nextSeq = file.lastReferenceSeq + 1;
    created = {
      id: uuidv4(),
      referenceNumber: generateReferenceNumber(nextSeq),
      fullName: input.fullName,
      email: input.email,
      contactNumber: input.contactNumber,
      preferredContactMethod: input.preferredContactMethod,
      projectTitle: input.projectTitle,
      description: input.description,
      initialProposedAmount: input.initialProposedAmount,
      category: input.category,
      otherCategory: input.otherCategory,
      status: 'Pending',
      amountPaid: 0,
      adminNotes: '',
      publicMessage: '',
      rejectionReason: null,
      notificationStatus: 'pending',
      notificationError: null,
      statusHistory: [{ status: 'Pending', changedAt: now }],
      pingCount: 0,
      lastPingAt: null,
      pingHistory: [],
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      rejectedAt: null,
    };
    return {
      lastReferenceSeq: nextSeq,
      requests: [...file.requests, created],
    };
  });

  // Notify asynchronously so a slow/failed Telegram call never blocks the
  // public submission response. The saved request is the source of truth.
  void notifyAndUpdateStatus(created.id);

  await createNotification({
    type: 'new_request',
    requestId: created.id,
    referenceNumber: created.referenceNumber,
    title: 'New Project Request',
    message: `New project request from ${created.fullName}.`,
  });

  return created;
}

async function notifyAndUpdateStatus(requestId: string): Promise<void> {
  const file = await requestsStore.read();
  const request = file.requests.find((r) => r.id === requestId);
  if (!request) return;

  const result = await sendTelegramNotification(request);

  await requestsStore.update((current) => ({
    ...current,
    requests: current.requests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            notificationStatus: result.success ? 'sent' : 'failed',
            notificationError: result.success ? null : result.error ?? 'Unknown error',
          }
        : r
    ),
  }));

  if (!result.success) {
    logger.error('Telegram notification failed for request.', { requestId });
    await createNotification({
      type: 'telegram_notification_failed',
      requestId: request.id,
      referenceNumber: request.referenceNumber,
      title: 'Telegram Notification Failed',
      message: `Telegram delivery failed for new request ${request.referenceNumber}.`,
    });
  }
}

export interface ListRequestsOptions {
  search?: string;
  status?: RequestStatus;
  category?: RequestCategory;
  /** 'hasFollowUp' = at least one ping, 'noFollowUp' = zero pings, 'multipleFollowUps' = two or more pings. */
  followUpFilter?: 'hasFollowUp' | 'noFollowUp' | 'multipleFollowUps';
  sortBy?: 'createdAt' | 'updatedAt' | 'initialProposedAmount' | 'lastPingAt' | 'pingCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ListRequestsResult {
  items: ProjectRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listRequests(options: ListRequestsOptions): Promise<ListRequestsResult> {
  const file = await requestsStore.read();
  let items = file.requests.map(normalizeRequest);

  if (options.search) {
    const q = options.search.toLowerCase();
    items = items.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.referenceNumber.toLowerCase().includes(q) ||
        r.projectTitle.toLowerCase().includes(q)
    );
  }

  if (options.status) {
    items = items.filter((r) => r.status === options.status);
  }

  if (options.category) {
    items = items.filter((r) => r.category === options.category);
  }

  if (options.followUpFilter === 'hasFollowUp') {
    items = items.filter((r) => r.pingCount > 0);
  } else if (options.followUpFilter === 'noFollowUp') {
    items = items.filter((r) => r.pingCount === 0);
  } else if (options.followUpFilter === 'multipleFollowUps') {
    items = items.filter((r) => r.pingCount >= 2);
  }

  const sortBy = options.sortBy ?? 'createdAt';
  const sortOrder = options.sortOrder ?? 'desc';
  items.sort((a, b) => {
    const aVal = sortValue(a, sortBy);
    const bVal = sortValue(b, sortBy);
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const total = items.length;
  const pageSize = options.pageSize && options.pageSize > 0 ? options.pageSize : 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = options.page && options.page > 0 ? Math.min(options.page, totalPages) : 1;
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  return { items: paged, total, page, pageSize, totalPages };
}

function sortValue(request: ProjectRequest, sortBy: NonNullable<ListRequestsOptions['sortBy']>): number {
  switch (sortBy) {
    case 'initialProposedAmount':
      return request.initialProposedAmount;
    case 'pingCount':
      return request.pingCount;
    case 'updatedAt':
      return new Date(request.updatedAt).getTime();
    case 'lastPingAt':
      // Requests with no pings sort last regardless of sort order direction.
      return request.lastPingAt ? new Date(request.lastPingAt).getTime() : -Infinity;
    case 'createdAt':
    default:
      return new Date(request.createdAt).getTime();
  }
}

export async function getRequestById(id: string): Promise<ProjectRequest | null> {
  const file = await requestsStore.read();
  const found = file.requests.find((r) => r.id === id);
  return found ? normalizeRequest(found) : null;
}

export interface UpdateRequestInput {
  status?: RequestStatus;
  adminNotes?: string;
  amountPaid?: number;
  rejectionReason?: string | null;
  publicMessage?: string;
}

export async function updateRequest(
  id: string,
  patch: UpdateRequestInput
): Promise<ProjectRequest | null> {
  let updated: ProjectRequest | null = null;
  let previousStatus: RequestStatus | null = null;

  await requestsStore.update((file) => {
    const index = file.requests.findIndex((r) => r.id === id);
    if (index === -1) {
      return file;
    }

    const existing = normalizeRequest(file.requests[index]);
    previousStatus = existing.status;
    const now = new Date().toISOString();
    const statusChanged = patch.status && patch.status !== existing.status;

    const next: ProjectRequest = {
      ...existing,
      status: patch.status ?? existing.status,
      adminNotes: patch.adminNotes ?? existing.adminNotes,
      publicMessage: patch.publicMessage ?? existing.publicMessage,
      amountPaid: patch.amountPaid ?? existing.amountPaid,
      rejectionReason:
        patch.rejectionReason !== undefined ? patch.rejectionReason : existing.rejectionReason,
      updatedAt: now,
      completedAt:
        patch.status === 'Done'
          ? (existing.completedAt ?? now)
          : patch.status
            ? null
            : existing.completedAt,
      rejectedAt:
        patch.status === 'Rejected'
          ? (existing.rejectedAt ?? now)
          : patch.status
            ? null
            : existing.rejectedAt,
      statusHistory: statusChanged
        ? [...existing.statusHistory, { status: patch.status as RequestStatus, changedAt: now }]
        : existing.statusHistory,
    };

    updated = next;
    const requests = [...file.requests];
    requests[index] = next;
    return { ...file, requests };
  });

  if (updated !== null && patch.status !== undefined && previousStatus !== null && patch.status !== previousStatus) {
    const changedRequest: ProjectRequest = updated;
    const fromStatus: RequestStatus = previousStatus;
    await createNotification({
      type: 'request_status_changed',
      requestId: changedRequest.id,
      referenceNumber: changedRequest.referenceNumber,
      title: 'Request Status Changed',
      message: `Request ${changedRequest.referenceNumber} status changed from ${fromStatus} to ${changedRequest.status}.`,
    });
  }

  return updated;
}

export async function deleteRequest(id: string): Promise<boolean> {
  let deleted = false;

  await requestsStore.update((file) => {
    const nextRequests = file.requests.filter((r) => r.id !== id);
    deleted = nextRequests.length !== file.requests.length;
    return { ...file, requests: nextRequests };
  });

  return deleted;
}

export async function retryNotification(id: string): Promise<ProjectRequest | null> {
  const file = await requestsStore.read();
  const request = file.requests.find((r) => r.id === id);
  if (!request) return null;

  const result = await sendTelegramNotification(request);

  let updated: ProjectRequest | null = null;
  await requestsStore.update((current) => {
    const requests = current.requests.map((r) =>
      r.id === id
        ? {
            ...r,
            notificationStatus: (result.success ? 'sent' : 'failed') as ProjectRequest['notificationStatus'],
            notificationError: result.success ? null : result.error ?? 'Unknown error',
          }
        : r
    );
    updated = requests.find((r) => r.id === id) ?? null;
    return { ...current, requests };
  });

  await createNotification({
    type: 'telegram_notification_retried',
    requestId: id,
    referenceNumber: request.referenceNumber,
    title: 'Telegram Notification Retried',
    message: result.success
      ? `Telegram notification for ${request.referenceNumber} was retried successfully.`
      : `Retry of the Telegram notification for ${request.referenceNumber} failed again.`,
  });

  return updated;
}

/** Finds a request by reference number and email, matching both case-insensitively. Never reveals which field mismatched. */
async function findRequestByReferenceAndEmail(
  referenceNumber: string,
  email: string
): Promise<ProjectRequest | null> {
  const file = await requestsStore.read();
  const normalizedRef = referenceNumber.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  const found = file.requests.find(
    (r) => r.referenceNumber.toLowerCase() === normalizedRef && r.email.toLowerCase() === normalizedEmail
  );

  return found ? normalizeRequest(found) : null;
}

function toPublicView(request: ProjectRequest): PublicTrackedRequest {
  return {
    id: request.id,
    referenceNumber: request.referenceNumber,
    projectTitle: request.projectTitle,
    category: request.category,
    otherCategory: request.otherCategory,
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    preferredContactMethod: request.preferredContactMethod,
    initialProposedAmount: request.initialProposedAmount,
    publicMessage: request.publicMessage,
    publicRejectionReason: request.status === 'Rejected' ? request.rejectionReason : null,
    pingCount: request.pingCount,
    lastPingAt: request.lastPingAt,
    pingCooldownHours: config.pingCooldownHours,
  };
}

/**
 * Looks up a request for the public tracking page. Requires both the
 * reference number and the email used at submission time to match
 * (case-insensitively) so reference numbers alone cannot be used to probe
 * for other clients' requests.
 */
export async function trackRequest(
  referenceNumber: string,
  email: string
): Promise<PublicTrackedRequest | null> {
  const request = await findRequestByReferenceAndEmail(referenceNumber, email);
  return request ? toPublicView(request) : null;
}

export type SendPingResult =
  | { success: true; request: ProjectRequest; ping: PingHistoryEntry }
  | { success: false; reason: 'not_found' }
  | { success: false; reason: 'closed_status' }
  | { success: false; reason: 'cooldown'; nextAllowedAt: string };

const CLOSED_STATUSES: RequestStatus[] = ['Done', 'Rejected'];

export interface SendPingInput {
  requestId: string;
  referenceNumber: string;
  email: string;
  message: string | null;
}

/**
 * Records a client follow-up ("ping") on a request after verifying that the
 * request id, reference number, and email all belong to the same request,
 * the request is not already closed, and the cooldown period has elapsed.
 * The cooldown is always enforced server-side — a client-side timer alone
 * could trivially be bypassed.
 */
export async function sendPing(input: SendPingInput): Promise<SendPingResult> {
  const file = await requestsStore.read();
  const normalizedRef = input.referenceNumber.trim().toLowerCase();
  const normalizedEmail = input.email.trim().toLowerCase();

  const existing = file.requests.find(
    (r) =>
      r.id === input.requestId &&
      r.referenceNumber.toLowerCase() === normalizedRef &&
      r.email.toLowerCase() === normalizedEmail
  );

  if (!existing) {
    return { success: false, reason: 'not_found' };
  }

  const normalizedExisting = normalizeRequest(existing);

  if (CLOSED_STATUSES.includes(normalizedExisting.status)) {
    return { success: false, reason: 'closed_status' };
  }

  if (normalizedExisting.lastPingAt) {
    const cooldownMs = config.pingCooldownHours * 60 * 60 * 1000;
    const nextAllowedAt = new Date(new Date(normalizedExisting.lastPingAt).getTime() + cooldownMs);
    if (nextAllowedAt.getTime() > Date.now()) {
      return { success: false, reason: 'cooldown', nextAllowedAt: nextAllowedAt.toISOString() };
    }
  }

  const now = new Date().toISOString();
  const previousPing = normalizedExisting.pingHistory[normalizedExisting.pingHistory.length - 1] ?? null;
  const newPing: PingHistoryEntry = {
    id: uuidv4(),
    pingNumber: normalizedExisting.pingCount + 1,
    message: input.message && input.message.trim().length > 0 ? input.message.trim() : null,
    createdAt: now,
    telegramNotificationStatus: 'pending',
    telegramNotificationError: null,
  };

  let updatedRequest: ProjectRequest | null = null;

  await requestsStore.update((current) => {
    const index = current.requests.findIndex((r) => r.id === input.requestId);
    if (index === -1) return current;

    const target = normalizeRequest(current.requests[index]);
    const next: ProjectRequest = {
      ...target,
      pingCount: target.pingCount + 1,
      lastPingAt: now,
      pingHistory: [...target.pingHistory, newPing],
    };

    updatedRequest = next;
    const requests = [...current.requests];
    requests[index] = next;
    return { ...current, requests };
  });

  if (!updatedRequest) {
    return { success: false, reason: 'not_found' };
  }

  const finalRequest: ProjectRequest = updatedRequest;
  const result = await sendTelegramPingNotification(finalRequest, newPing, previousPing);
  const finalPing: PingHistoryEntry = {
    ...newPing,
    telegramNotificationStatus: result.success ? 'sent' : 'failed',
    telegramNotificationError: result.success ? null : (result.error ?? 'Unknown error'),
  };

  let persistedRequest: ProjectRequest = finalRequest;
  await requestsStore.update((current) => {
    const requests = current.requests.map((r) => {
      if (r.id !== input.requestId) return r;
      const normalized = normalizeRequest(r);
      const nextRequest = {
        ...normalized,
        pingHistory: normalized.pingHistory.map((p) => (p.id === newPing.id ? finalPing : p)),
      };
      persistedRequest = nextRequest;
      return nextRequest;
    });
    return { ...current, requests };
  });

  const ordinal = formatOrdinal(newPing.pingNumber);
  await createNotification({
    type: 'request_ping',
    requestId: finalRequest.id,
    referenceNumber: finalRequest.referenceNumber,
    title: 'Client Follow-up',
    message: `${finalRequest.fullName} sent the ${ordinal} follow-up for ${finalRequest.referenceNumber}.`,
    pingNumber: newPing.pingNumber,
  });

  if (!result.success) {
    logger.error('Telegram ping notification failed.', { requestId: finalRequest.id });
    await createNotification({
      type: 'telegram_notification_failed',
      requestId: finalRequest.id,
      referenceNumber: finalRequest.referenceNumber,
      title: 'Telegram Notification Failed',
      message: `Telegram delivery failed for the ${ordinal} follow-up on ${finalRequest.referenceNumber}.`,
      pingNumber: newPing.pingNumber,
    });
  }

  return { success: true, request: persistedRequest, ping: finalPing };
}

/** Retries sending the Telegram notification for a single ping entry (admin action). */
export async function retryPingNotification(
  requestId: string,
  pingId: string
): Promise<ProjectRequest | null> {
  const file = await requestsStore.read();
  const existing = file.requests.find((r) => r.id === requestId);
  if (!existing) return null;

  const normalized = normalizeRequest(existing);
  const pingIndex = normalized.pingHistory.findIndex((p) => p.id === pingId);
  if (pingIndex === -1) return null;

  const currentPing = normalized.pingHistory[pingIndex];
  const previousPing = normalized.pingHistory[pingIndex - 1] ?? null;
  const result = await sendTelegramPingNotification(normalized, currentPing, previousPing);

  let updated: ProjectRequest | null = null;
  await requestsStore.update((current) => {
    const requests = current.requests.map((r) => {
      if (r.id !== requestId) return r;
      const n = normalizeRequest(r);
      const nextRequest = {
        ...n,
        pingHistory: n.pingHistory.map((p) =>
          p.id === pingId
            ? {
                ...p,
                telegramNotificationStatus: (result.success ? 'sent' : 'failed') as ProjectRequest['notificationStatus'],
                telegramNotificationError: result.success ? null : result.error ?? 'Unknown error',
              }
            : p
        ),
      };
      updated = nextRequest;
      return nextRequest;
    });
    return { ...current, requests };
  });

  await createNotification({
    type: 'telegram_notification_retried',
    requestId,
    referenceNumber: normalized.referenceNumber,
    title: 'Telegram Notification Retried',
    message: result.success
      ? `Follow-up notification retry for ${normalized.referenceNumber} succeeded.`
      : `Follow-up notification retry for ${normalized.referenceNumber} failed again.`,
    pingNumber: currentPing.pingNumber,
  });

  return updated;
}
