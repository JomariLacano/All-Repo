import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';

export function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ identifier, password });
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
          <LogIn size={22} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Log in to manage submitted project requests.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Input
            label="Username or Email"
            required
            name="identifier"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <Input
            label="Password"
            required
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" isLoading={isSubmitting} disabled={isSubmitting}>
            Log In
          </Button>
        </form>
      </Card>
    </div>
  );
}
