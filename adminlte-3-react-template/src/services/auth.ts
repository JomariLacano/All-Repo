import { IUser } from '@app/types/user';

/**
 * Mock authentication service.
 *
 * Accepts any email/password and keeps the session in localStorage so the
 * template is fully navigable without a backend. Replace the bodies of these
 * functions with calls to your real API; the rest of the app only depends on
 * these signatures and the `IUser` type.
 */

const SESSION_KEY = 'auth.currentUser';
const MOCK_LATENCY_MS = 500;

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const createMockUser = (email: string): IUser => ({
  id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
  email,
  displayName: email.split('@')[0],
  photoURL: null,
  createdAt: new Date().toISOString(),
});

const saveSession = (user: IUser) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const loginWithEmail = async (
  email: string,
  _password: string
): Promise<IUser> => {
  await delay(MOCK_LATENCY_MS);
  const user = createMockUser(email);
  saveSession(user);
  return user;
};

export const registerWithEmail = async (
  email: string,
  _password: string
): Promise<IUser> => {
  await delay(MOCK_LATENCY_MS);
  const user = createMockUser(email);
  saveSession(user);
  return user;
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem(SESSION_KEY);
};

/** Restores the persisted session, if any. Called once on app start. */
export const getCurrentUser = async (): Promise<IUser | null> => {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) {
    return null;
  }
  try {
    return JSON.parse(stored) as IUser;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};
