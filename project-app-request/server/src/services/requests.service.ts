import { v4 as uuidv4 } from 'uuid';
import { requestsStore } from '../storage/stores';
import { generateReferenceNumber } from './referenceNumber.service';
import { sendTelegramNotification } from './telegram.service';
import {
  ContactMethod,
  ProjectRequest,
  RequestCategory,
  RequestStatus,
} from '../types';
import { logger } from '../utils/logger';

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
      rejectionReason: null,
      notificationStatus: 'pending',
      notificationError: null,
      statusHistory: [{ status: 'Pending', changedAt: now }],
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
  }
}

export interface ListRequestsOptions {
  search?: string;
  status?: RequestStatus;
  category?: RequestCategory;
  sortBy?: 'createdAt' | 'initialProposedAmount';
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
  let items = [...file.requests];

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

  const sortBy = options.sortBy ?? 'createdAt';
  const sortOrder = options.sortOrder ?? 'desc';
  items.sort((a, b) => {
    const aVal = sortBy === 'createdAt' ? new Date(a.createdAt).getTime() : a.initialProposedAmount;
    const bVal = sortBy === 'createdAt' ? new Date(b.createdAt).getTime() : b.initialProposedAmount;
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

export async function getRequestById(id: string): Promise<ProjectRequest | null> {
  const file = await requestsStore.read();
  return file.requests.find((r) => r.id === id) ?? null;
}

export interface UpdateRequestInput {
  status?: RequestStatus;
  adminNotes?: string;
  amountPaid?: number;
  rejectionReason?: string | null;
}

export async function updateRequest(
  id: string,
  patch: UpdateRequestInput
): Promise<ProjectRequest | null> {
  let updated: ProjectRequest | null = null;

  await requestsStore.update((file) => {
    const index = file.requests.findIndex((r) => r.id === id);
    if (index === -1) {
      return file;
    }

    const existing = file.requests[index];
    const now = new Date().toISOString();
    const statusChanged = patch.status && patch.status !== existing.status;

    const next: ProjectRequest = {
      ...existing,
      status: patch.status ?? existing.status,
      adminNotes: patch.adminNotes ?? existing.adminNotes,
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

  return updated;
}
