import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Extracts a user-friendly error message from any Axios/API error. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
    if (error.code === 'ERR_NETWORK') return 'Unable to reach the server. Please check your connection.';
  }
  return fallback;
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { details?: { field: string; message: string }[] } | undefined;
    if (data?.details) {
      return Object.fromEntries(data.details.map((d) => [d.field, d.message]));
    }
  }
  return {};
}

/** Extracts the `nextAllowedAt` cooldown timestamp from a 429 ping-cooldown error response, if present. */
export function getCooldownNextAllowedAt(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { nextAllowedAt?: string } | undefined;
    return data?.nextAllowedAt ?? null;
  }
  return null;
}
