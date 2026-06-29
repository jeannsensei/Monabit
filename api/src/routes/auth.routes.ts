import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { authLimiter } from '@/middlewares/rate-limit.middleware';
import { asyncHandler } from '@/utils/async-handler';

const router = Router();

router.post('/register', authLimiter, asyncHandler(authController.register));
router.post('/login', authLimiter, asyncHandler(authController.login));
router.post('/google', authLimiter, asyncHandler(authController.googleLogin));
router.post('/logout', asyncHandler(authController.logout));
router.post('/refresh', asyncHandler(authController.refresh));
router.get('/me', authMiddleware, asyncHandler(authController.me));

export { router as authRoutes };
