import { apiClient } from './client';
import { AdminAccount } from '../types';

export interface LoginPayload {
  identifier: string;
  password: string;
}

export async function loginAdmin(payload: LoginPayload): Promise<{ admin: AdminAccount }> {
  const { data } = await apiClient.post<{ admin: AdminAccount }>('/auth/login', payload);
  return data;
}

export async function logoutAdmin(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function getCurrentAdmin(): Promise<{ admin: AdminAccount }> {
  const { data } = await apiClient.get<{ admin: AdminAccount }>('/auth/me');
  return data;
}
