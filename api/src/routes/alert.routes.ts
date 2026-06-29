import { Router } from 'express';
import { alertController } from '@/controllers/alert.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { asyncHandler } from '@/utils/async-handler';

const router = Router();

router.use(asyncHandler(authMiddleware));

router.get('/', asyncHandler(alertController.list));
router.post('/', asyncHandler(alertController.create));
router.post('/check', asyncHandler(alertController.check));
router.put('/:id', asyncHandler(alertController.update));
router.delete('/:id', asyncHandler(alertController.remove));

export { router as alertRoutes };
