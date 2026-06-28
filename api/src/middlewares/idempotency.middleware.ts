import type { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
import { env } from '@/config/env';

const idempotencyCache = new NodeCache({
  stdTTL: env.IDEMPOTENCY_TTL_SECONDS,
  checkperiod: 120,
});

export function idempotencyMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET') {
    next();
    return;
  }

  const key = req.headers['x-idempotency-key'] as string | undefined;
  if (!key) {
    next();
    return;
  }

  const cached = idempotencyCache.get<{ status: number; body: unknown }>(key);
  if (cached) {
    res.status(cached.status).json(cached.body);
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = function (body: unknown) {
    idempotencyCache.set(key, { status: res.statusCode, body });
    return originalJson(body);
  };

  next();
}
