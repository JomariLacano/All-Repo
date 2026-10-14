import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getRequests,
  getRequest,
  patchRequest,
  removeRequest,
  retryRequestNotification,
} from '../controllers/adminRequests.controller';
import { getDashboard } from '../controllers/dashboard.controller';
import { getAccount, patchAccount, patchPassword } from '../controllers/account.controller';
import { updateRequestSchema, updateAccountSchema, changePasswordSchema } from '../utils/validation.schemas';

const router = Router();

router.use(requireAuth);

router.get('/requests', asyncHandler(getRequests));
router.get('/requests/:id', asyncHandler(getRequest));
router.patch('/requests/:id', validateBody(updateRequestSchema), asyncHandler(patchRequest));
router.delete('/requests/:id', asyncHandler(removeRequest));
router.post('/requests/:id/retry-notification', asyncHandler(retryRequestNotification));

router.get('/dashboard', asyncHandler(getDashboard));

router.get('/account', asyncHandler(getAccount));
router.patch('/account', validateBody(updateAccountSchema), asyncHandler(patchAccount));
router.patch('/account/password', validateBody(changePasswordSchema), asyncHandler(patchPassword));

export default router;
