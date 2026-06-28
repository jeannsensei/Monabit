import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { favoritesService } from '@/services/favorites.service';

const addFavoriteSchema = z.object({
  coin_id: z.string().min(1),
  coin_symbol: z.string().min(1),
  coin_name: z.string().min(1),
});

export const favoritesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const favorites = await favoritesService.list(req.user.id);
      res.json(favorites);
    } catch (error) {
      next(error);
    }
  },

  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const body = addFavoriteSchema.parse(req.body);
      const favorite = await favoritesService.add(req.user.id, body.coin_id, body.coin_symbol, body.coin_name);
      res.status(201).json(favorite);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await favoritesService.remove(req.user.id, String(req.params.coinId));
      res.json({ message: 'Favorite removed' });
    } catch (error) {
      next(error);
    }
  },
};
