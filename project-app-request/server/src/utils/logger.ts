/**
 * Minimal structured logger. Only ever logs safe, non-sensitive fields.
 * Never pass raw tokens, passwords, or client proposed amounts to these functions.
 */
function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.log(`[${timestamp()}] INFO: ${message}`, meta ?? '');
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.warn(`[${timestamp()}] WARN: ${message}`, meta ?? '');
  },
  error(message: string, meta?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.error(`[${timestamp()}] ERROR: ${message}`, meta ?? '');
  },
};
