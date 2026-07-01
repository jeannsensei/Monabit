import { Router } from 'express';
import { adminController } from '@/controllers/admin.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { adminMiddleware } from '@/middlewares/admin.middleware';
import { asyncHandler } from '@/utils/async-handler';

const router = Router();

router.use(asyncHandler(authMiddleware), adminMiddleware);

router.get('/users', asyncHandler(adminController.listUsers));
router.get('/users/:id', asyncHandler(adminController.getUser));
router.post('/users', asyncHandler(adminController.createUser));
router.put('/users/:id', asyncHandler(adminController.updateUser));
router.post('/users/:id/reset-password', asyncHandler(adminController.resetPassword));
router.delete('/users/:id', asyncHandler(adminController.deleteUser));
router.delete('/users/:id/hard', asyncHandler(adminController.hardDeleteUser));

export { router as adminRoutes };
