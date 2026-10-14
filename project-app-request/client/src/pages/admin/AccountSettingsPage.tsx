import { FormEvent, useEffect, useState } from 'react';
import { User, KeyRound } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { fetchAdminAccount, updateAdminAccount, changeAdminPassword } from '../../api/account';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { Skeleton } from '../../components/ui/Skeleton';

export function AccountSettingsPage() {
  const { showToast } = useToast();
  const { setAdmin } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    profileImageUrl: '',
    telegramChatId: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { admin } = await fetchAdminAccount();
        if (cancelled) return;
        setProfile({
          name: admin.name,
          email: admin.email,
          username: admin.username,
          phone: admin.phone,
          profileImageUrl: admin.profileImageUrl ?? '',
          telegramChatId: admin.telegramChatId ?? '',
        });
      } catch (err) {
        showToast(getErrorMessage(err, 'Failed to load account settings.'), 'error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setIsSavingProfile(true);
    try {
      const { admin } = await updateAdminAccount(profile);
      setAdmin(admin);
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      setProfileError(getErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await changeAdminPassword(passwordForm);
      showToast('Password updated successfully.', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(getErrorMessage(err, 'Failed to update password.'));
    } finally {
      setIsSavingPassword(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your profile information and password.
        </p>
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <User size={18} />
          <h3 className="font-semibold">Profile Information</h3>
        </div>
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
          <Input
            label="Display Name"
            required
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            label="Email Address"
            required
            type="email"
            value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
          />
          <Input
            label="Username"
            required
            value={profile.username}
            onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
          />
          <Input
            label="Phone Number"
            value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
          />
          <Input
            label="Profile Image URL"
            placeholder="https://example.com/avatar.jpg"
            value={profile.profileImageUrl}
            onChange={(e) => setProfile((p) => ({ ...p, profileImageUrl: e.target.value }))}
          />
          <Input
            label="Telegram Chat ID"
            hint="Used to receive new project request notifications."
            value={profile.telegramChatId}
            onChange={(e) => setProfile((p) => ({ ...p, telegramChatId: e.target.value }))}
          />

          {profileError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {profileError}
            </div>
          )}

          <Button type="submit" isLoading={isSavingProfile} className="self-start">
            Save Profile
          </Button>
        </form>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <KeyRound size={18} />
          <h3 className="font-semibold">Change Password</h3>
        </div>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <Input
            label="Current Password"
            required
            type="password"
            autoComplete="current-password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
          />
          <Input
            label="New Password"
            required
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
          />
          <Input
            label="Confirm New Password"
            required
            type="password"
            autoComplete="new-password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
          />

          {passwordError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {passwordError}
            </div>
          )}

          <Button type="submit" isLoading={isSavingPassword} className="self-start">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
