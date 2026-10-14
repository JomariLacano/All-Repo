import { Response } from 'express';
import {
  changeAdminPassword,
  getAdminAccount,
  updateAdminAccount,
} from '../services/account.service';
import { sanitizeAdmin } from '../services/auth.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/** GET /api/admin/account */
export async function getAccount(_req: AuthenticatedRequest, res: Response): Promise<void> {
  const admin = await getAdminAccount();
  if (!admin) {
    res.status(404).json({ error: 'Admin account not found.' });
    return;
  }
  res.status(200).json({ admin: sanitizeAdmin(admin) });
}

/** PATCH /api/admin/account */
export async function patchAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  const body = req.body as {
    profileImageUrl?: string | null;
    telegramChatId?: string | null;
    [key: string]: unknown;
  };

  // Normalize empty strings to null for optional URL/ID fields.
  const normalized = {
    ...body,
    profileImageUrl: body.profileImageUrl === '' ? null : body.profileImageUrl,
    telegramChatId: body.telegramChatId === '' ? null : body.telegramChatId,
  };

  const updated = await updateAdminAccount(normalized);
  if (!updated) {
    res.status(404).json({ error: 'Admin account not found.' });
    return;
  }
  res.status(200).json({ admin: sanitizeAdmin(updated) });
}

/** PATCH /api/admin/account/password */
export async function patchPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  const result = await changeAdminPassword(currentPassword, newPassword);

  if (!result.success) {
    const message =
      result.reason === 'invalid_current_password'
        ? 'Current password is incorrect.'
        : 'Admin account not found.';
    res.status(400).json({ error: message });
    return;
  }

  res.status(200).json({ message: 'Password updated successfully.' });
}
