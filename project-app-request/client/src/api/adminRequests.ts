import { apiClient } from './client';
import { PaginatedRequests, ProjectRequest, RequestCategory, RequestStatus } from '../types';

export type FollowUpFilter = 'hasFollowUp' | 'noFollowUp' | 'multipleFollowUps';

export interface ListRequestsParams {
  search?: string;
  status?: RequestStatus | '';
  category?: RequestCategory | '';
  followUpFilter?: FollowUpFilter | '';
  sortBy?: 'createdAt' | 'updatedAt' | 'initialProposedAmount' | 'lastPingAt' | 'pingCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export async function fetchAdminRequests(params: ListRequestsParams): Promise<PaginatedRequests> {
  const { data } = await apiClient.get<PaginatedRequests>('/admin/requests', { params });
  return data;
}

export async function fetchAdminRequestById(id: string): Promise<{ request: ProjectRequest }> {
  const { data } = await apiClient.get<{ request: ProjectRequest }>(`/admin/requests/${id}`);
  return data;
}

export interface UpdateRequestPayload {
  status?: RequestStatus;
  adminNotes?: string;
  publicMessage?: string;
  amountPaid?: number;
  rejectionReason?: string | null;
}

export async function updateAdminRequest(
  id: string,
  payload: UpdateRequestPayload
): Promise<{ request: ProjectRequest }> {
  const { data } = await apiClient.patch<{ request: ProjectRequest }>(`/admin/requests/${id}`, payload);
  return data;
}

export async function deleteAdminRequest(id: string): Promise<void> {
  await apiClient.delete(`/admin/requests/${id}`);
}

export async function retryNotification(id: string): Promise<{ request: ProjectRequest }> {
  const { data } = await apiClient.post<{ request: ProjectRequest }>(
    `/admin/requests/${id}/retry-notification`
  );
  return data;
}

export async function retryPingNotification(
  requestId: string,
  pingId: string
): Promise<{ request: ProjectRequest }> {
  const { data } = await apiClient.post<{ request: ProjectRequest }>(
    `/admin/requests/${requestId}/pings/${pingId}/retry-notification`
  );
  return data;
}
