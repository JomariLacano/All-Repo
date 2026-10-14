import { apiClient } from './client';
import { ContactMethod, RequestCategory } from '../types';

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
