import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { UnauthorizedError } from '@/utils/errors';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().optional(),
  full_name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const googleSchema = z.object({
  id_token: z.string(),
});

const refreshSchema = z.object({
  refresh_token: z.string(),
});

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const body = registerSchema.parse(req.body);
      const result = await authService.register(body.email, body.password, body.username, body.full_name);
      if (result.error) {
        res.status(409).json({ error: result.error });
        return;
      }
      res.status(201).json({ user: result.user, session: result.session });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const body = loginSchema.parse(req.body);
      const result = await authService.login(body.email, body.password);
      if (result.error) {
        throw new UnauthorizedError(result.error);
      }
      res.json({ user: result.user, session: result.session });
    } catch (error) {
      next(error);
    }
  },

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const body = googleSchema.parse(req.body);
      const result = await authService.loginWithGoogle(body.id_token);
      if (result.error) {
        throw new UnauthorizedError(result.error);
      }
      res.json({ user: result.user, session: result.session });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.slice(7);
      if (token) {
        await authService.logout(token);
      }
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(req.user);
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const body = refreshSchema.parse(req.body);
      const result = await authService.refreshSession(body.refresh_token);
      if (result.error) {
        throw new UnauthorizedError(result.error);
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
