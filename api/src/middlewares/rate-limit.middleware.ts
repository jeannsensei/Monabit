import rateLimit from 'express-rate-limit';
import { env } from '@/config/env';

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip ?? 'unknown',
  handler: (_req, res) => {
    res.status(429).json({ error: 'Too many requests, please try again later' });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.ip ?? 'unknown',
  handler: (_req, res) => {
    res.status(429).json({ error: 'Too many login attempts, please try again later' });
  },
});
