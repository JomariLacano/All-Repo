import { apiClient } from './client';
import { AdminAccount } from '../types';

export interface UpdateAccountPayload {
  name?: string;
  email?: string;
  username?: string;
  phone?: string;
  profileImageUrl?: string | null;
  telegramChatId?: string | null;
}

export async function fetchAdminAccount(): Promise<{ admin: AdminAccount }> {
  const { data } = await apiClient.get<{ admin: AdminAccount }>('/admin/account');
  return data;
}

export async function updateAdminAccount(payload: UpdateAccountPayload): Promise<{ admin: AdminAccount }> {
  const { data } = await apiClient.patch<{ admin: AdminAccount }>('/admin/account', payload);
  return data;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export async function changeAdminPassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const { data } = await apiClient.patch<{ message: string }>('/admin/account/password', payload);
  return data;
}
