import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

interface DarkModeContextValue {
  isDark: boolean;
  toggle: () => void;
}

const DarkModeContext = createContext<DarkModeContextValue | undefined>(undefined);

const STORAGE_KEY = 'theme-preference';

function getInitialTheme(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const value = useMemo(
    () => ({
      isDark,
      toggle: () => setIsDark((prev) => !prev),
    }),
    [isDark]
  );

  return <DarkModeContext.Provider value={value}>{children}</DarkModeContext.Provider>;
}

export function useDarkMode(): DarkModeContextValue {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error('useDarkMode must be used within a DarkModeProvider');
  return ctx;
}
