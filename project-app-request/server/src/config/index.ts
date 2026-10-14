import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    // eslint-disable-next-line no-console
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: required('JWT_SECRET'),
  /** Token lifetime in seconds (2 hours). */
  jwtExpiresInSeconds: 2 * 60 * 60,
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  },
  adminInitial: {
    name: process.env.ADMIN_INITIAL_NAME || 'Administrator',
    email: process.env.ADMIN_INITIAL_EMAIL || '',
    password: process.env.ADMIN_INITIAL_PASSWORD || '',
  },
  isProduction: process.env.NODE_ENV === 'production',
};
