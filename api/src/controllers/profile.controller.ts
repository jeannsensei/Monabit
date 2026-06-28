import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { userRepository } from '@/repositories/user.repository';

const updateProfileSchema = z.object({
  username: z.string().optional(),
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  preferences: z.record(z.unknown()).optional(),
});

export const profileController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findById(req.user.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updateProfileSchema.parse(req.body);
      const updated = await userRepository.update(req.user.id, body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },
};
