import { adminStore } from '../storage/stores';
import { AdminAccount } from '../types';
import { hashPassword, verifyPassword } from './auth.service';

export interface UpdateAccountInput {
  name?: string;
  email?: string;
  username?: string;
  phone?: string;
  profileImageUrl?: string | null;
  telegramChatId?: string | null;
}

export async function getAdminAccount(): Promise<AdminAccount | null> {
  const file = await adminStore.read();
  return file.admin;
}

export async function updateAdminAccount(input: UpdateAccountInput): Promise<AdminAccount | null> {
  let updated: AdminAccount | null = null;

  await adminStore.update((file) => {
    if (!file.admin) return file;
    updated = {
      ...file.admin,
      name: input.name ?? file.admin.name,
      email: input.email ? input.email.toLowerCase() : file.admin.email,
      username: input.username ?? file.admin.username,
      phone: input.phone ?? file.admin.phone,
      profileImageUrl: input.profileImageUrl !== undefined ? input.profileImageUrl : file.admin.profileImageUrl,
      telegramChatId: input.telegramChatId !== undefined ? input.telegramChatId : file.admin.telegramChatId,
      updatedAt: new Date().toISOString(),
    };
    return { admin: updated };
  });

  return updated;
}

export type PasswordChangeResult =
  | { success: true }
  | { success: false; reason: 'not_found' | 'invalid_current_password' };

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<PasswordChangeResult> {
  const file = await adminStore.read();
  if (!file.admin) {
    return { success: false, reason: 'not_found' };
  }

  const isValid = await verifyPassword(currentPassword, file.admin.passwordHash);
  if (!isValid) {
    return { success: false, reason: 'invalid_current_password' };
  }

  const newHash = await hashPassword(newPassword);

  await adminStore.update((current) => {
    if (!current.admin) return current;
    return {
      admin: {
        ...current.admin,
        passwordHash: newHash,
        updatedAt: new Date().toISOString(),
      },
    };
  });

  return { success: true };
}
