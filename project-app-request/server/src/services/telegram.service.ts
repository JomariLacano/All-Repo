import { config } from '../config';
import { logger } from '../utils/logger';
import { escapeMarkdownV2 } from '../utils/sanitize';
import { formatCurrencyPHP, formatDateTime } from '../utils/format';
import { formatOrdinal } from '../utils/ordinal';
import { PingHistoryEntry, ProjectRequest } from '../types';

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

function buildPingMessage(
  request: ProjectRequest,
  currentPing: PingHistoryEntry,
  previousPing: PingHistoryEntry | null
): string {
  const ordinal = formatOrdinal(currentPing.pingNumber);

  const lines = [
    '🔔 *Project Request Follow\\-up*',
    '',
    `*Reference:* ${escapeMarkdownV2(request.referenceNumber)}`,
    `*Client:* ${escapeMarkdownV2(request.fullName)}`,
    `*Project:* ${escapeMarkdownV2(request.projectTitle)}`,
    `*Current Status:* ${escapeMarkdownV2(request.status)}`,
    '',
    escapeMarkdownV2(`This is the client's ${ordinal} ping.`),
  ];

  if (currentPing.message) {
    lines.push('', '*Current Follow\\-up:*', escapeMarkdownV2(`"${currentPing.message}"`));
  }

  lines.push('');
  if (previousPing) {
    const previousOrdinal = formatOrdinal(previousPing.pingNumber);
    lines.push(
      '*Previous Ping:*',
      escapeMarkdownV2(`${previousOrdinal} ping sent on ${formatDateTime(previousPing.createdAt)}`),
      ''
    );
  } else {
    lines.push(escapeMarkdownV2('No previous ping is available.'), '');
  }

  const currentOrdinal = formatOrdinal(currentPing.pingNumber);
  lines.push(
    '*Current Ping:*',
    escapeMarkdownV2(`${currentOrdinal} ping sent on ${formatDateTime(currentPing.createdAt)}`),
    '',
    `*Total Pings:* ${request.pingCount}`
  );

  return lines.join('\n');
}

async function sendRawMessage(text: string): Promise<TelegramSendResult> {
  const { botToken, chatId } = config.telegram;

  if (!botToken || !chatId) {
    logger.warn('Telegram notification skipped: bot token or chat id not configured.');
    return { success: false, error: 'Telegram is not configured on the server.' };
  }

  const url = `${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`;

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
      logger.error('Telegram notification failed.', { status: response.status });
      return { success: false, error: `Telegram API responded with status ${response.status}.` };
    }

    return { success: true };
  } catch {
    logger.error('Telegram notification request threw an error.');
    return { success: false, error: 'Failed to reach the Telegram API.' };
  }
}

/**
 * Sends a formatted notification to the configured Telegram chat.
 * Never throws; always resolves with a success flag and a safe error summary.
 * The bot token is never included in logs or thrown errors.
 */
export async function sendTelegramNotification(request: ProjectRequest): Promise<TelegramSendResult> {
  return sendRawMessage(buildMessage(request));
}

/** Sends a follow-up/ping Telegram notification, including the previous ping for context. */
export async function sendTelegramPingNotification(
  request: ProjectRequest,
  currentPing: PingHistoryEntry,
  previousPing: PingHistoryEntry | null
): Promise<TelegramSendResult> {
  return sendRawMessage(buildPingMessage(request, currentPing, previousPing));
}
