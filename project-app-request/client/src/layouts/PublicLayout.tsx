import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Code2 } from 'lucide-react';
import { DarkModeToggle } from '../components/ui/DarkModeToggle';

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Submit a Request', to: '/request' },
    { label: 'Admin Login', to: '/admin/login' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Code2 size={18} />
            </span>
            Freelance Dev Requests
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <DarkModeToggle />
          </nav>

          <div className="flex items-center gap-1 sm:hidden">
            <DarkModeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 dark:border-slate-800 sm:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  location.pathname === link.to
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        &copy; {new Date().getFullYear()} Freelance Software Development. All rights reserved.
      </footer>
    </div>
  );
}
