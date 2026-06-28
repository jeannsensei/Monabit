import { Router } from 'express';
import { adminController } from '@/controllers/admin.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { adminMiddleware } from '@/middlewares/admin.middleware';
import { asyncHandler } from '@/utils/async-handler';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/users', asyncHandler(adminController.listUsers));
router.get('/users/:id', asyncHandler(adminController.getUser));
router.post('/users', asyncHandler(adminController.createUser));
router.put('/users/:id', asyncHandler(adminController.updateUser));
router.delete('/users/:id', asyncHandler(adminController.deleteUser));

export { router as adminRoutes };
