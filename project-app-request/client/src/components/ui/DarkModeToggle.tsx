import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';

export function DarkModeToggle() {
  const { isDark, toggle } = useDarkMode();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
