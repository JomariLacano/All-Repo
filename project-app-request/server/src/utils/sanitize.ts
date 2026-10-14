/**
 * Sanitizes a string for safe inclusion in Telegram's MarkdownV2 messages by
 * escaping characters that MarkdownV2 treats as formatting syntax.
 */
export function escapeMarkdownV2(input: string): string {
  return input.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, (match) => `\\${match}`);
}

/** Strips characters that are not needed for plain-text safe display. */
export function sanitizeText(input: string): string {
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
}
