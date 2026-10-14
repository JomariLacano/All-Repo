import { apiClient } from './client';
import { ContactMethod, PublicTrackedRequest, RequestCategory } from '../types';

export interface SubmitRequestPayload {
  fullName: string;
  email: string;
  contactNumber: string;
  preferredContactMethod: ContactMethod;
  projectTitle: string;
  description: string;
  initialProposedAmount: number;
  category: RequestCategory;
  otherCategory?: string | null;
  consent: true;
  website?: string;
}

export interface SubmitRequestResponse {
  referenceNumber: string;
  message: string;
}

export async function submitProjectRequest(
  payload: SubmitRequestPayload
): Promise<SubmitRequestResponse> {
  const { data } = await apiClient.post<SubmitRequestResponse>('/requests', payload);
  return data;
}

export interface TrackRequestPayload {
  referenceNumber: string;
  email: string;
}

export async function trackProjectRequest(
  payload: TrackRequestPayload
): Promise<{ request: PublicTrackedRequest }> {
  const { data } = await apiClient.post<{ request: PublicTrackedRequest }>('/requests/track', payload);
  return data;
}

export interface SendPingPayload {
  referenceNumber: string;
  email: string;
  message?: string;
}

export interface SendPingResponse {
  message: string;
  pingCount: number;
  lastPingAt: string | null;
}

export async function sendProjectPing(
  requestId: string,
  payload: SendPingPayload
): Promise<SendPingResponse> {
  const { data } = await apiClient.post<SendPingResponse>(`/requests/${requestId}/ping`, payload);
  return data;
}
