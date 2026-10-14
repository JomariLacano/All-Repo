import { FormEvent, useState } from 'react';
import { Search, X, SearchCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { TrackingResultCard } from '../../components/public/TrackingResultCard';
import { sendProjectPing, trackProjectRequest } from '../../api/publicRequests';
import { getCooldownNextAllowedAt, getErrorMessage } from '../../api/client';
import { isValidEmail, isNonEmpty } from '../../utils/validators';
import { PublicTrackedRequest } from '../../types';
import { formatDateTime } from '../../utils/format';
import { useToast } from '../../hooks/useToast';

interface FormState {
  referenceNumber: string;
  email: string;
}

const INITIAL_FORM: FormState = { referenceNumber: '', email: '' };

export function TrackRequestPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicTrackedRequest | null>(null);

  const [isSendingPing, setIsSendingPing] = useState(false);
  const [cooldownMessage, setCooldownMessage] = useState<string | null>(null);

  const { showToast } = useToast();

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!isNonEmpty(form.referenceNumber)) {
      nextErrors.referenceNumber = 'Reference number is required.';
    }
    if (!isValidEmail(form.email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (isSearching) return;
    setSearchError(null);
    setCooldownMessage(null);

    if (!validate()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const { request } = await trackProjectRequest({
        referenceNumber: form.referenceNumber.trim(),
        email: form.email.trim(),
      });
      setResult(request);
    } catch (err) {
      setResult(null);
      setSearchError(
        getErrorMessage(err, 'We could not find a request matching the provided information.')
      );
    } finally {
      setIsSearching(false);
    }
  }

  function handleClear() {
    setForm(INITIAL_FORM);
    setErrors({});
    setResult(null);
    setSearchError(null);
    setCooldownMessage(null);
    setHasSearched(false);
  }

  async function handleSendPing(message: string) {
    if (!result) return;
    setIsSendingPing(true);
    setCooldownMessage(null);
    try {
      await sendProjectPing(result.id, {
        referenceNumber: result.referenceNumber,
        email: form.email.trim(),
        message,
      });

      showToast('Your follow-up has been sent.', 'success');

      // Refresh to reflect the updated ping count / last ping date.
      const { request } = await trackProjectRequest({
        referenceNumber: form.referenceNumber.trim(),
        email: form.email.trim(),
      });
      setResult(request);
    } catch (err) {
      const nextAllowedAt = getCooldownNextAllowedAt(err);
      if (nextAllowedAt) {
        setCooldownMessage(
          `You recently sent a follow-up. You may send another one after ${formatDateTime(nextAllowedAt)}.`
        );
      } else {
        showToast(getErrorMessage(err, 'We could not send your follow-up. Please try again.'), 'error');
      }
    } finally {
      setIsSendingPing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Track Your Request
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Enter your reference number and the email address you used when submitting your request.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSearch} noValidate className="flex flex-col gap-4">
          <Input
            label="Reference Number"
            required
            name="referenceNumber"
            placeholder="PR-2026-000001"
            value={form.referenceNumber}
            onChange={(e) => updateField('referenceNumber', e.target.value)}
            error={errors.referenceNumber}
          />
          <Input
            label="Email Address"
            required
            type="email"
            name="email"
            placeholder="client@example.com"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            error={errors.email}
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" isLoading={isSearching} disabled={isSearching} className="sm:flex-1">
              <Search size={16} className="mr-1.5" />
              Search
            </Button>
            <Button type="button" variant="outline" onClick={handleClear} disabled={isSearching}>
              <X size={16} className="mr-1.5" />
              Clear
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-6">
        {!hasSearched && !isSearching && (
          <EmptyState
            icon={<SearchCheck size={24} />}
            title="Track your project request"
            message="Enter your reference number and email above to see its current status."
          />
        )}

        {hasSearched && searchError && !isSearching && (
          <ErrorState title="Request not found" message={searchError} />
        )}

        {result && !isSearching && (
          <TrackingResultCard
            request={result}
            onSendPing={handleSendPing}
            isSendingPing={isSendingPing}
            cooldownMessage={cooldownMessage}
          />
        )}
      </div>
    </div>
  );
}
