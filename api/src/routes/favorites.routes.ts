import { Router } from 'express';
import { favoritesController } from '@/controllers/favorites.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { asyncHandler } from '@/utils/async-handler';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(favoritesController.list));
router.post('/', asyncHandler(favoritesController.add));
router.delete('/:coinId', asyncHandler(favoritesController.remove));

export { router as favoritesRoutes };
