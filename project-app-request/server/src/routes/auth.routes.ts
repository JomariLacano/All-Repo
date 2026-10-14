import { Router } from 'express';
import { login, logout, me } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate.middleware';
import { loginSchema } from '../utils/validation.schemas';
import { loginLimiter } from '../middleware/rateLimit.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/login', loginLimiter, validateBody(loginSchema), asyncHandler(login));
router.post('/logout', logout);
router.get('/me', requireAuth, asyncHandler(me));

export default router;
