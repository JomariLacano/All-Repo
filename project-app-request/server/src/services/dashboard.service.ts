import { requestsStore } from '../storage/stores';
import { ProjectRequest, RequestCategory, RequestStatus } from '../types';

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  reviewingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  totalProposedValue: number;
  totalAmountPaid: number;
  outstandingAmount: number;
  requestsByStatus: Record<RequestStatus, number>;
  requestsByCategory: Record<string, number>;
  monthlyAmountPaid: { month: string; amountPaid: number }[];
  revenueByCategory: { category: string; amountPaid: number }[];
  proposedVsPaid: { month: string; proposed: number; paid: number }[];
}

const STATUSES: RequestStatus[] = ['Pending', 'Reviewing', 'In Progress', 'Done', 'Rejected'];
const CATEGORIES: RequestCategory[] = [
  'Web Application',
  'Documentation',
  'Bug Fixing',
  'Add a Feature',
  'Other',
];

function monthKey(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const file = await requestsStore.read();
  const requests = file.requests;

  const countByStatus = (status: RequestStatus) => requests.filter((r) => r.status === status).length;

  const requestsByStatus = STATUSES.reduce(
    (acc, status) => {
      acc[status] = countByStatus(status);
      return acc;
    },
    {} as Record<RequestStatus, number>
  );

  const requestsByCategory = CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = requests.filter((r) => r.category === category).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalProposedValue = requests.reduce((sum, r) => sum + r.initialProposedAmount, 0);
  const totalAmountPaid = requests.reduce((sum, r) => sum + r.amountPaid, 0);
  const outstandingAmount = requests
    .filter((r) => r.status === 'Done')
    .reduce((sum, r) => sum + Math.max(0, r.initialProposedAmount - r.amountPaid), 0);

  const monthlyMap = new Map<string, number>();
  const proposedVsPaidMap = new Map<string, { proposed: number; paid: number }>();

  requests.forEach((r: ProjectRequest) => {
    const key = monthKey(r.createdAt);
    const proposedEntry = proposedVsPaidMap.get(key) ?? { proposed: 0, paid: 0 };
    proposedEntry.proposed += r.initialProposedAmount;
    proposedEntry.paid += r.amountPaid;
    proposedVsPaidMap.set(key, proposedEntry);

    if (r.status === 'Done' && r.completedAt) {
      const paidKey = monthKey(r.completedAt);
      monthlyMap.set(paidKey, (monthlyMap.get(paidKey) ?? 0) + r.amountPaid);
    }
  });

  const monthlyAmountPaid = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amountPaid]) => ({ month, amountPaid }));

  const proposedVsPaid = Array.from(proposedVsPaidMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, proposed: v.proposed, paid: v.paid }));

  const revenueByCategoryMap = new Map<string, number>();
  requests
    .filter((r) => r.status === 'Done')
    .forEach((r) => {
      const key = r.category === 'Other' && r.otherCategory ? r.otherCategory : r.category;
      revenueByCategoryMap.set(key, (revenueByCategoryMap.get(key) ?? 0) + r.amountPaid);
    });

  const revenueByCategory = Array.from(revenueByCategoryMap.entries()).map(([category, amountPaid]) => ({
    category,
    amountPaid,
  }));

  return {
    totalRequests: requests.length,
    pendingRequests: requestsByStatus.Pending,
    reviewingRequests: requestsByStatus.Reviewing,
    inProgressRequests: requestsByStatus['In Progress'],
    completedRequests: requestsByStatus.Done,
    rejectedRequests: requestsByStatus.Rejected,
    totalProposedValue,
    totalAmountPaid,
    outstandingAmount,
    requestsByStatus,
    requestsByCategory,
    monthlyAmountPaid,
    revenueByCategory,
    proposedVsPaid,
  };
}
