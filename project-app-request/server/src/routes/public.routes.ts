import { Router } from 'express';
import { healthCheck, sendPingHandler, submitRequest, trackRequestHandler } from '../controllers/public.controller';
import { validateBody } from '../middleware/validate.middleware';
import { createRequestSchema, pingRequestSchema, trackRequestSchema } from '../utils/validation.schemas';
import { pingLimiter, submitRequestLimiter, trackRequestLimiter } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/health', asyncHandler(healthCheck));
router.post('/requests', submitRequestLimiter, validateBody(createRequestSchema), asyncHandler(submitRequest));
router.post(
  '/requests/track',
  trackRequestLimiter,
  validateBody(trackRequestSchema),
  asyncHandler(trackRequestHandler)
);
router.post(
  '/requests/:id/ping',
  pingLimiter,
  validateBody(pingRequestSchema),
  asyncHandler(sendPingHandler)
);

export default router;
