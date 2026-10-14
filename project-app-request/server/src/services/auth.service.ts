import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { adminStore } from '../storage/stores';
import { AdminAccount, AuthTokenPayload } from '../types';
import { logger } from '../utils/logger';

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signAdminToken(admin: AdminAccount): string {
  const payload: AuthTokenPayload = { adminId: admin.id, email: admin.email };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresInSeconds });
}

export function verifyAdminToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Creates server/data/admin.json with a hashed password from environment
 * variables the first time the server starts. Subsequent starts are no-ops
 * so the file (and any edits made via Account Settings) is never reset.
 */
export async function ensureInitialAdmin(): Promise<void> {
  const data = await adminStore.read();
  if (data.admin) {
    return;
  }

  if (!config.adminInitial.email || !config.adminInitial.password) {
    logger.warn(
      'No admin account exists yet and ADMIN_INITIAL_EMAIL / ADMIN_INITIAL_PASSWORD are not set. ' +
        'Set them in server/.env and restart the server to create the first admin account.'
    );
    return;
  }

  const passwordHash = await hashPassword(config.adminInitial.password);
  const now = new Date().toISOString();

  const admin: AdminAccount = {
    id: uuidv4(),
    name: config.adminInitial.name,
    email: config.adminInitial.email.toLowerCase(),
    username: config.adminInitial.email.toLowerCase(),
    phone: '',
    profileImageUrl: null,
    telegramChatId: config.telegram.chatId || null,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  await adminStore.write({ admin });
  logger.info('Initial admin account created.', { email: admin.email });
}

export function sanitizeAdmin(admin: AdminAccount): Omit<AdminAccount, 'passwordHash'> {
  const { passwordHash, ...safe } = admin;
  return safe;
}
