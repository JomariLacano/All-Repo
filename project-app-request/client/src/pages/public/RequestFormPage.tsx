import { FormEvent, useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SuccessModal } from '../../components/public/SuccessModal';
import { submitProjectRequest } from '../../api/publicRequests';
import { getErrorMessage, getFieldErrors } from '../../api/client';
import { isValidEmail, isValidPhMobile, isNonEmpty } from '../../utils/validators';
import { ContactMethod, RequestCategory } from '../../types';
import { Info } from 'lucide-react';

const CATEGORY_OPTIONS: { value: RequestCategory; label: string }[] = [
  { value: 'Web Application', label: 'Web Application' },
  { value: 'Documentation', label: 'Documentation' },
  { value: 'Bug Fixing', label: 'Bug Fixing' },
  { value: 'Add a Feature', label: 'Add a Feature' },
  { value: 'Other', label: 'Other' },
];

const CONTACT_METHOD_OPTIONS: { value: ContactMethod; label: string }[] = [
  { value: 'Phone Call', label: 'Phone Call' },
  { value: 'SMS', label: 'SMS' },
  { value: 'Email', label: 'Email' },
];

const DESCRIPTION_MAX_LENGTH = 5000;

interface FormState {
  fullName: string;
  email: string;
  contactNumber: string;
  projectTitle: string;
  description: string;
  initialProposedAmount: string;
  category: RequestCategory | '';
  otherCategory: string;
  preferredContactMethod: ContactMethod;
  consent: boolean;
  website: string; // honeypot
}

const INITIAL_STATE: FormState = {
  fullName: '',
  email: '',
  contactNumber: '',
  projectTitle: '',
  description: '',
  initialProposedAmount: '',
  category: '',
  otherCategory: '',
  preferredContactMethod: 'Phone Call',
  consent: false,
  website: '',
};

export function RequestFormPage() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!isNonEmpty(form.fullName) || form.fullName.trim().length < 2) {
      nextErrors.fullName = 'Full name must be at least 2 characters.';
    } else if (form.fullName.trim().length > 100) {
      nextErrors.fullName = 'Full name must be at most 100 characters.';
    }

    if (!isValidEmail(form.email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!isValidPhMobile(form.contactNumber)) {
      nextErrors.contactNumber = 'Please enter a valid Philippine mobile number (e.g. 09171234567).';
    }

    if (!isNonEmpty(form.projectTitle) || form.projectTitle.trim().length < 3) {
      nextErrors.projectTitle = 'Project title must be at least 3 characters.';
    }

    if (!isNonEmpty(form.description) || form.description.trim().length < 20) {
      nextErrors.description = 'Please provide a more detailed description (at least 20 characters).';
    }

    const amount = Number(form.initialProposedAmount);
    if (form.initialProposedAmount.trim() === '' || Number.isNaN(amount) || amount < 0) {
      nextErrors.initialProposedAmount = 'Please enter a valid amount of zero or greater.';
    }

    if (!form.category) {
      nextErrors.category = 'Please select a category.';
    }

    if (form.category === 'Other' && !isNonEmpty(form.otherCategory)) {
      nextErrors.otherCategory = 'Please specify the category.';
    }

    if (!form.consent) {
      nextErrors.consent = 'You must confirm the information is correct to continue.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await submitProjectRequest({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        contactNumber: form.contactNumber.trim(),
        preferredContactMethod: form.preferredContactMethod,
        projectTitle: form.projectTitle.trim(),
        description: form.description.trim(),
        initialProposedAmount: Number(form.initialProposedAmount),
        category: form.category as RequestCategory,
        otherCategory: form.category === 'Other' ? form.otherCategory.trim() : null,
        consent: true,
        website: form.website,
      });

      setReferenceNumber(response.referenceNumber);
      setForm(INITIAL_STATE);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors as Partial<Record<keyof FormState, string>>);
      }
      setSubmitError(getErrorMessage(err, 'We could not submit your request. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Submit a Project Request
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          No account needed. Fill out the form below and I'll get back to you soon.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* Honeypot field — visually hidden from real users, bots often fill every field */}
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="website">Leave this field empty</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => updateField('website', e.target.value)}
            />
          </div>

          <Input
            label="Full Name"
            required
            name="fullName"
            value={form.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            error={errors.fullName}
            minLength={2}
            maxLength={100}
            autoComplete="name"
          />

          <Input
            label="Email Address"
            required
            type="email"
            name="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            label="Contact Number"
            required
            name="contactNumber"
            placeholder="09171234567"
            value={form.contactNumber}
            onChange={(e) => updateField('contactNumber', e.target.value)}
            error={errors.contactNumber}
            hint="Philippine mobile number format, e.g. 09171234567"
            autoComplete="tel"
          />

          <Select
            label="Preferred Contact Method"
            required
            name="preferredContactMethod"
            value={form.preferredContactMethod}
            onChange={(e) => updateField('preferredContactMethod', e.target.value as ContactMethod)}
            options={CONTACT_METHOD_OPTIONS}
          />

          <Input
            label="Project Title"
            required
            name="projectTitle"
            value={form.projectTitle}
            onChange={(e) => updateField('projectTitle', e.target.value)}
            error={errors.projectTitle}
            maxLength={150}
          />

          <Textarea
            label="Project Description"
            required
            name="description"
            rows={6}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            error={errors.description}
            maxLength={DESCRIPTION_MAX_LENGTH}
            showCounter
            hint="Describe what you need, key features, and any deadlines."
          />

          <div>
            <Input
              label="Initial Proposed Amount (PHP)"
              required
              type="number"
              name="initialProposedAmount"
              min={0}
              step="0.01"
              value={form.initialProposedAmount}
              onChange={(e) => updateField('initialProposedAmount', e.target.value)}
              error={errors.initialProposedAmount}
            />
            <p className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Info size={14} className="mt-0.5 shrink-0" />
              This is only your initial proposed budget and is not the final agreed price. We will
              discuss and agree on the final price together.
            </p>
          </div>

          <Select
            label="Category"
            required
            name="category"
            placeholder="Select a category"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value as RequestCategory)}
            options={CATEGORY_OPTIONS}
            error={errors.category}
          />

          {form.category === 'Other' && (
            <Input
              label="Other Category"
              required
              name="otherCategory"
              value={form.otherCategory}
              onChange={(e) => updateField('otherCategory', e.target.value)}
              error={errors.otherCategory}
              placeholder="Please specify"
            />
          )}

          <label className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => updateField('consent', e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>
              I confirm that the information provided is correct and I agree to be contacted regarding
              this request.
            </span>
          </label>
          {errors.consent && <p className="-mt-3 text-xs font-medium text-red-600 dark:text-red-400">{errors.consent}</p>}

          {submitError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {submitError}
            </div>
          )}

          <Button type="submit" size="lg" isLoading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </Card>

      <SuccessModal
        isOpen={referenceNumber !== null}
        referenceNumber={referenceNumber ?? ''}
        onClose={() => setReferenceNumber(null)}
      />
    </div>
  );
}
