import { Response } from 'express';
import { getDashboardStats } from '../services/dashboard.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/** GET /api/admin/dashboard */
export async function getDashboard(_req: AuthenticatedRequest, res: Response): Promise<void> {
  const stats = await getDashboardStats();
  res.status(200).json(stats);
}
