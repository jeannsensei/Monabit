import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabase } from '@/config/supabase';
import { userService } from '@/services/user.service';
import { AppError } from '@/utils/errors';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().optional(),
  full_name: z.string().optional(),
  role: z.enum(['admin', 'user']).optional(),
});

const updateUserSchema = z.object({
  username: z.string().optional(),
  full_name: z.string().optional(),
  role: z.enum(['admin', 'user']).optional(),
  is_active: z.boolean().optional(),
});

export const adminController = {
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(String(req.query.page ?? '1'));
      const perPage = parseInt(String(req.query.per_page ?? '20'));
      const result = await userService.list(page, perPage);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getById(String(req.params.id));
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createUserSchema.parse(req.body);
      const user = await userService.create(req.user.id, body, String(req.ip ?? 'unknown'));
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updateUserSchema.parse(req.body);
      const user = await userService.update(req.user.id, String(req.params.id), body, String(req.ip ?? 'unknown'));
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.deactivate(req.user.id, String(req.params.id), String(req.ip ?? 'unknown'));
      res.json({ message: 'User deactivated', user });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { password } = z.object({ password: z.string().min(8) }).parse(req.body);
      const { data, error } = await supabase.auth.admin.updateUserById(String(req.params.id), { password });
      if (error) throw new AppError(400, error.message);
      res.json({ message: 'Password updated' });
    } catch (error) {
      next(error);
    }
  },
};
