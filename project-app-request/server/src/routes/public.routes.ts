import { Router } from 'express';
import { healthCheck, submitRequest } from '../controllers/public.controller';
import { validateBody } from '../middleware/validate.middleware';
import { createRequestSchema } from '../utils/validation.schemas';
import { submitRequestLimiter } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/health', asyncHandler(healthCheck));
router.post('/requests', submitRequestLimiter, validateBody(createRequestSchema), asyncHandler(submitRequest));

export default router;
