import { Request, Response } from 'express';
import { adminStore } from '../storage/stores';
import { sanitizeAdmin, signAdminToken, verifyPassword } from '../services/auth.service';
import { AUTH_COOKIE_NAME, AuthenticatedRequest } from '../middleware/auth.middleware';
import { config } from '../config';

const COOKIE_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours, matches JWT expiry

function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax' as const,
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  };
}

/** POST /api/auth/login */
export async function login(req: Request, res: Response): Promise<void> {
  const { identifier, password } = req.body as { identifier: string; password: string };

  const file = await adminStore.read();
  const admin = file.admin;

  if (!admin) {
    res.status(401).json({ error: 'Invalid credentials.' });
    return;
  }

  const normalizedIdentifier = identifier.trim().toLowerCase();
  const matches =
    normalizedIdentifier === admin.email.toLowerCase() ||
    normalizedIdentifier === admin.username.toLowerCase();

  if (!matches) {
    res.status(401).json({ error: 'Invalid credentials.' });
    return;
  }

  const passwordValid = await verifyPassword(password, admin.passwordHash);
  if (!passwordValid) {
    res.status(401).json({ error: 'Invalid credentials.' });
    return;
  }

  const token = signAdminToken(admin);
  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions());
  res.status(200).json({ admin: sanitizeAdmin(admin) });
}

/** POST /api/auth/logout */
export function logout(_req: Request, res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
  res.status(200).json({ message: 'Logged out.' });
}

/** GET /api/auth/me */
export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  const file = await adminStore.read();
  if (!file.admin || !req.admin || file.admin.id !== req.admin.adminId) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }
  res.status(200).json({ admin: sanitizeAdmin(file.admin) });
}
