export type RequestStatus =
  | 'Pending'
  | 'Reviewing'
  | 'In Progress'
  | 'Done'
  | 'Rejected';

export type ContactMethod = 'Phone Call' | 'SMS' | 'Email';

export type RequestCategory =
  | 'Web Application'
  | 'Documentation'
  | 'Bug Fixing'
  | 'Add a Feature'
  | 'Other';

export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface StatusHistoryEntry {
  status: RequestStatus;
  changedAt: string;
  note?: string;
}

export interface PingHistoryEntry {
  id: string;
  pingNumber: number;
  message: string | null;
  createdAt: string;
  telegramNotificationStatus: NotificationStatus;
  telegramNotificationError: string | null;
}

export interface ProjectRequest {
  id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  contactNumber: string;
  preferredContactMethod: ContactMethod;
  projectTitle: string;
  description: string;
  initialProposedAmount: number;
  category: RequestCategory;
  otherCategory: string | null;
  status: RequestStatus;
  amountPaid: number;
  adminNotes: string;
  /** Optional public-facing update message shown to the client when tracking the request. */
  publicMessage: string;
  rejectionReason: string | null;
  notificationStatus: NotificationStatus;
  notificationError: string | null;
  statusHistory: StatusHistoryEntry[];
  pingCount: number;
  lastPingAt: string | null;
  pingHistory: PingHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  rejectedAt: string | null;
}

export interface RequestsFile {
  lastReferenceSeq: number;
  requests: ProjectRequest[];
}

export type AdminNotificationType =
  | 'new_request'
  | 'request_ping'
  | 'request_status_changed'
  | 'telegram_notification_failed'
  | 'telegram_notification_retried';

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  requestId: string | null;
  referenceNumber: string | null;
  title: string;
  message: string;
  pingNumber: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsFile {
  notifications: AdminNotification[];
}

/**
 * Sanitized view of a request returned to the public tracking endpoint.
 * Deliberately excludes admin notes, notification errors, and any other
 * internal-only fields.
 */
export interface PublicTrackedRequest {
  /**
   * Internal request id. Used only to call the follow-up/ping endpoint; it is
   * an opaque, non-guessable UUID and is never rendered in the tracking UI.
   */
  id: string;
  referenceNumber: string;
  projectTitle: string;
  category: RequestCategory;
  otherCategory: string | null;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  preferredContactMethod: ContactMethod;
  initialProposedAmount: number;
  publicMessage: string;
  publicRejectionReason: string | null;
  pingCount: number;
  lastPingAt: string | null;
  /** Configured follow-up cooldown in hours, so the client UI can proactively show wait times. */
  pingCooldownHours: number;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  profileImageUrl: string | null;
  telegramChatId: string | null;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminFile {
  admin: AdminAccount | null;
}

export interface AuthTokenPayload {
  adminId: string;
  email: string;
}
