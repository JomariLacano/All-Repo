import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { AdminAccount } from '../types';
import { getCurrentAdmin, loginAdmin, logoutAdmin, LoginPayload } from '../api/auth';
import { getErrorMessage } from '../api/client';

interface AuthContextValue {
  admin: AdminAccount | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  setAdmin: (admin: AdminAccount) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdminState] = useState<AdminAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { admin: current } = await getCurrentAdmin();
        if (!cancelled) setAdminState(current);
      } catch {
        if (!cancelled) setAdminState(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    try {
      const { admin: loggedIn } = await loginAdmin(payload);
      setAdminState(loggedIn);
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Invalid username/email or password.'));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } finally {
      setAdminState(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      isLoading,
      isAuthenticated: admin !== null,
      login,
      logout,
      setAdmin: setAdminState,
    }),
    [admin, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
