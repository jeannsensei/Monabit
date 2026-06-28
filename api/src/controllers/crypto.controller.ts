import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { cryptoService } from '@/services/crypto.service';

const historyQuerySchema = z.object({
  days: z.coerce.number().min(1).max(365).default(7),
});

export const cryptoController = {
  async getTop10(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await cryptoService.getTop10();
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getMarketOverview(_req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await cryptoService.getMarketOverview();
      res.json(overview);
    } catch (error) {
      next(error);
    }
  },

  async getCoin(req: Request, res: Response, next: NextFunction) {
    try {
      const coin = await cryptoService.getCoinDetail(String(req.params.coinId));
      res.json(coin);
    } catch (error) {
      next(error);
    }
  },

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { days } = historyQuerySchema.parse(req.query);
      const history = await cryptoService.getCoinHistory(String(req.params.coinId), days);
      res.json(history);
    } catch (error) {
      next(error);
    }
  },

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = String(req.query.q ?? '');
      if (!q || q.length < 2) {
        res.json({ coins: [] });
        return;
      }
      const result = await cryptoService.searchCoins(q);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
