import { Router } from 'express';
import { cryptoController } from '@/controllers/crypto.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { asyncHandler } from '@/utils/async-handler';

const router = Router();

router.use(asyncHandler(authMiddleware));

router.get('/top10', asyncHandler(cryptoController.getTop10));
router.get('/market-overview', asyncHandler(cryptoController.getMarketOverview));
router.get('/search', asyncHandler(cryptoController.search));
router.get('/by-ids', asyncHandler(cryptoController.getByIds));
router.get('/:coinId/history', asyncHandler(cryptoController.getHistory));
router.get('/:coinId', asyncHandler(cryptoController.getCoin));

export { router as cryptoRoutes };
