import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { alertService } from '@/services/alert.service';

const createAlertSchema = z.object({
  coin_id: z.string().min(1),
  coin_symbol: z.string().min(1),
  target_price: z.number().positive(),
  direction: z.enum(['above', 'below']),
});

export const alertController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await alertService.list(req.user.id);
      res.json(alerts);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createAlertSchema.parse(req.body);
      const alert = await alertService.create(req.user.id, body);
      res.status(201).json(alert);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const removed = await alertService.remove(req.user.id, String(req.params.id));
      if (!removed) {
        res.status(404).json({ error: 'Alert not found' });
        return;
      }
      res.json({ message: 'Alert removed' });
    } catch (error) {
      next(error);
    }
  },

  async check(req: Request, res: Response, next: NextFunction) {
    try {
      const triggered = await alertService.checkAndTrigger(req.user.id);
      res.json({ triggered });
    } catch (error) {
      next(error);
    }
  },
};
