/**
 * Generates a sequential, human-friendly reference number such as PR-2026-000001.
 * The sequence counter is supplied by the caller (persisted in requests.json)
 * so numbering survives restarts and never resets.
 */
export function generateReferenceNumber(sequence: number, date: Date = new Date()): string {
  const year = date.getFullYear();
  const padded = String(sequence).padStart(6, '0');
  return `PR-${year}-${padded}`;
}
