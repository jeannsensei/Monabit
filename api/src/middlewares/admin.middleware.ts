import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '@/utils/errors';

export function adminMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }
  next();
}
