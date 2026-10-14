import { config } from '../config';
import { logger } from '../utils/logger';
import { escapeMarkdownV2 } from '../utils/sanitize';
import { formatCurrencyPHP, formatDateTime } from '../utils/format';
import { ProjectRequest } from '../types';

const TELEGRAM_API_BASE = 'https://api.telegram.org';

export interface TelegramSendResult {
  success: boolean;
  /** Safe-to-log error summary; never includes the bot token. */
  error?: string;
}

function buildMessage(request: ProjectRequest): string {
  const category =
    request.category === 'Other' && request.otherCategory
      ? `Other (${request.otherCategory})`
      : request.category;

  const lines = [
    '📌 *New Project Request*',
    '',
    `*Reference:* ${escapeMarkdownV2(request.referenceNumber)}`,
    `*Name:* ${escapeMarkdownV2(request.fullName)}`,
    `*Email:* ${escapeMarkdownV2(request.email)}`,
    `*Contact Number:* ${escapeMarkdownV2(request.contactNumber)}`,
    `*Preferred Contact:* ${escapeMarkdownV2(request.preferredContactMethod)}`,
    `*Category:* ${escapeMarkdownV2(category)}`,
    `*Project Title:* ${escapeMarkdownV2(request.projectTitle)}`,
    `*Initial Proposed Amount:* ${escapeMarkdownV2(formatCurrencyPHP(request.initialProposedAmount))}`,
    '',
    '*Description:*',
    escapeMarkdownV2(request.description),
    '',
    '*Submitted:*',
    escapeMarkdownV2(formatDateTime(request.createdAt)),
  ];

  return lines.join('\n');
}

/**
 * Sends a formatted notification to the configured Telegram chat.
 * Never throws; always resolves with a success flag and a safe error summary.
 * The bot token is never included in logs or thrown errors.
 */
export async function sendTelegramNotification(request: ProjectRequest): Promise<TelegramSendResult> {
  const { botToken, chatId } = config.telegram;

  if (!botToken || !chatId) {
    logger.warn('Telegram notification skipped: bot token or chat id not configured.');
    return { success: false, error: 'Telegram is not configured on the server.' };
  }

  const url = `${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`;
  const text = buildMessage(request);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'MarkdownV2',
      }),
    });

    if (!response.ok) {
      logger.error('Telegram notification failed.', {
        status: response.status,
        reference: request.referenceNumber,
      });
      return { success: false, error: `Telegram API responded with status ${response.status}.` };
    }

    return { success: true };
  } catch (err) {
    logger.error('Telegram notification request threw an error.', {
      reference: request.referenceNumber,
    });
    return { success: false, error: 'Failed to reach the Telegram API.' };
  }
}
