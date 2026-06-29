import { Router } from 'express';
import { profileController } from '@/controllers/profile.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { asyncHandler } from '@/utils/async-handler';

const router = Router();

router.use(asyncHandler(authMiddleware));

router.get('/', asyncHandler(profileController.getProfile));
router.put('/', asyncHandler(profileController.updateProfile));

export { router as profileRoutes };
