import { NextFunction, Request, Response } from 'express';
import { verifyAdminToken } from '../services/auth.service';

export const AUTH_COOKIE_NAME = 'admin_token';

export interface AuthenticatedRequest extends Request {
  admin?: { adminId: string; email: string };
}

/** Protects admin routes by requiring a valid JWT in the HTTP-only auth cookie. */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    return;
  }

  req.admin = payload;
  next();
}
