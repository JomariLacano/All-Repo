import { Response } from 'express';
import {
  deleteRequest,
  getRequestById,
  listRequests,
  retryNotification,
  retryPingNotification,
  updateRequest,
} from '../services/requests.service';
import { RequestCategory, RequestStatus } from '../types';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

type FollowUpFilter = 'hasFollowUp' | 'noFollowUp' | 'multipleFollowUps';
const VALID_FOLLOW_UP_FILTERS: FollowUpFilter[] = ['hasFollowUp', 'noFollowUp', 'multipleFollowUps'];
type SortByOption = 'createdAt' | 'updatedAt' | 'initialProposedAmount' | 'lastPingAt' | 'pingCount';
const VALID_SORT_BY: SortByOption[] = [
  'createdAt',
  'updatedAt',
  'initialProposedAmount',
  'lastPingAt',
  'pingCount',
];

/** GET /api/admin/requests */
export async function getRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { search, status, category, sortBy, sortOrder, page, pageSize, followUpFilter } = req.query;

  const result = await listRequests({
    search: typeof search === 'string' ? search : undefined,
    status: typeof status === 'string' && status ? (status as RequestStatus) : undefined,
    category: typeof category === 'string' && category ? (category as RequestCategory) : undefined,
    followUpFilter:
      typeof followUpFilter === 'string' && VALID_FOLLOW_UP_FILTERS.includes(followUpFilter as FollowUpFilter)
        ? (followUpFilter as FollowUpFilter)
        : undefined,
    sortBy:
      typeof sortBy === 'string' && VALID_SORT_BY.includes(sortBy as SortByOption)
        ? (sortBy as SortByOption)
        : 'createdAt',
    sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
  });

  res.status(200).json(result);
}

/** GET /api/admin/requests/:id */
export async function getRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
  const request = await getRequestById(req.params.id);
  if (!request) {
    res.status(404).json({ error: 'Request not found.' });
    return;
  }
  res.status(200).json({ request });
}

/** PATCH /api/admin/requests/:id */
export async function patchRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
  const existing = await getRequestById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Request not found.' });
    return;
  }

  const updated = await updateRequest(req.params.id, req.body);
  res.status(200).json({ request: updated });
}

/** DELETE /api/admin/requests/:id */
export async function removeRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
  const deleted = await deleteRequest(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Request not found.' });
    return;
  }
  res.status(200).json({ message: 'Request deleted.' });
}

/** POST /api/admin/requests/:id/retry-notification */
export async function retryRequestNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
  const updated = await retryNotification(req.params.id);
  if (!updated) {
    res.status(404).json({ error: 'Request not found.' });
    return;
  }
  res.status(200).json({ request: updated });
}

/** POST /api/admin/requests/:id/pings/:pingId/retry-notification */
export async function retryRequestPingNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
  const updated = await retryPingNotification(req.params.id, req.params.pingId);
  if (!updated) {
    res.status(404).json({ error: 'Request or follow-up entry not found.' });
    return;
  }
  res.status(200).json({ request: updated });
}
