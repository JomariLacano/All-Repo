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
  rejectionReason: string | null;
  notificationStatus: NotificationStatus;
  notificationError: string | null;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  rejectedAt: string | null;
}

export interface RequestsFile {
  lastReferenceSeq: number;
  requests: ProjectRequest[];
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
