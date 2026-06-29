import { Router } from 'express';
import { authRoutes } from '@/routes/auth.routes';
import { cryptoRoutes } from '@/routes/crypto.routes';
import { adminRoutes } from '@/routes/admin.routes';
import { profileRoutes } from '@/routes/profile.routes';
import { favoritesRoutes } from '@/routes/favorites.routes';
import { alertRoutes } from '@/routes/alert.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/crypto', cryptoRoutes);
router.use('/admin', adminRoutes);
router.use('/profile', profileRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/alerts', alertRoutes);

export { router as apiRoutes };
