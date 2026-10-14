import { z } from 'zod';

// Common Philippine mobile number formats: 09171234567, +639171234567, 639171234567,
// optionally with spaces or dashes between groups.
const PH_MOBILE_REGEX = /^(?:\+?63|0)9\d{2}[-\s]?\d{3}[-\s]?\d{4}$/;

export const createRequestSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(100, 'Full name must be at most 100 characters.'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.').max(254),
  contactNumber: z
    .string()
    .trim()
    .regex(PH_MOBILE_REGEX, 'Please enter a valid Philippine mobile number (e.g. 09171234567).'),
  preferredContactMethod: z.enum(['Phone Call', 'SMS', 'Email'], {
    errorMap: () => ({ message: 'Please select a valid preferred contact method.' }),
  }),
  projectTitle: z
    .string()
    .trim()
    .min(3, 'Project title must be at least 3 characters.')
    .max(150, 'Project title must be at most 150 characters.'),
  description: z
    .string()
    .trim()
    .min(20, 'Please provide a more detailed description (at least 20 characters).')
    .max(5000, 'Description must be at most 5000 characters.'),
  initialProposedAmount: z.coerce
    .number({ invalid_type_error: 'Proposed amount must be a number.' })
    .min(0, 'Proposed amount must be zero or greater.')
    .max(100_000_000, 'Proposed amount is unrealistically large.'),
  category: z.enum(['Web Application', 'Documentation', 'Bug Fixing', 'Add a Feature', 'Other'], {
    errorMap: () => ({ message: 'Please select a valid category.' }),
  }),
  otherCategory: z.string().trim().max(100).optional().nullable(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm the information is correct to continue.' }),
  }),
  // Honeypot field: must always be submitted empty by real users.
  website: z.string().max(0, 'Spam detected.').optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.category === 'Other' && (!data.otherCategory || data.otherCategory.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['otherCategory'],
      message: 'Please specify the category.',
    });
  }
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Username or email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export const updateRequestSchema = z.object({
  status: z.enum(['Pending', 'Reviewing', 'In Progress', 'Done', 'Rejected']).optional(),
  adminNotes: z.string().max(5000).optional(),
  publicMessage: z.string().max(2000).optional(),
  amountPaid: z.coerce.number().min(0, 'Amount paid must be zero or greater.').optional(),
  rejectionReason: z.string().max(2000).optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.status === 'Done' && (data.amountPaid === undefined || data.amountPaid === null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['amountPaid'],
      message: 'Amount paid is required when marking a request as Done.',
    });
  }
});

export const updateAccountSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().toLowerCase().email().max(254).optional(),
  username: z.string().trim().min(3).max(50).optional(),
  phone: z.string().trim().max(30).optional(),
  profileImageUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal('')),
  telegramChatId: z.string().trim().max(50).optional().nullable().or(z.literal('')),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters.')
      .max(128, 'New password must be at most 128 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm the new password.'),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match.',
      });
    }
  });

export const trackRequestSchema = z.object({
  referenceNumber: z
    .string()
    .trim()
    .min(1, 'Reference number is required.')
    .max(50, 'Reference number is too long.'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.').max(254),
});

export const pingRequestSchema = z.object({
  referenceNumber: z
    .string()
    .trim()
    .min(1, 'Reference number is required.')
    .max(50, 'Reference number is too long.'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.').max(254),
  message: z.string().trim().max(500, 'Follow-up message must be at most 500 characters.').optional().or(z.literal('')),
});
