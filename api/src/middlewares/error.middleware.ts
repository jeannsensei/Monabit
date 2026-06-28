import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    logger.warn({ requestId: req.requestId, errors: err.errors }, 'Validation error');
    res.status(422).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    logger.warn({ requestId: req.requestId, statusCode: err.statusCode, error: err.message }, 'Application error');
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error({ requestId: req.requestId, error: err.message, stack: err.stack }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
}
