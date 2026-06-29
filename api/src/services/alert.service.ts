import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/db';
import { priceAlerts } from '@/db/schema';
import { coingeckoService } from '@/services/coingecko.service';
import { logger } from '@/utils/logger';
import type { PriceAlert } from '@/types';

function mapAlert(row: typeof priceAlerts.$inferSelect): PriceAlert {
  return {
    id: row.id,
    user_id: row.userId,
    coin_id: row.coinId,
    coin_symbol: row.coinSymbol,
    target_price: Number(row.targetPrice),
    direction: row.direction as 'above' | 'below',
    is_triggered: row.isTriggered,
    is_active: row.isActive,
    created_at: row.createdAt.toISOString(),
  };
}

export const alertService = {
  async list(userId: string): Promise<PriceAlert[]> {
    const rows = await db
      .select()
      .from(priceAlerts)
      .where(eq(priceAlerts.userId, userId))
      .orderBy(sql`${priceAlerts.createdAt} DESC`);
    return rows.map(mapAlert);
  },

  async create(userId: string, data: {
    coin_id: string;
    coin_symbol: string;
    target_price: number;
    direction: 'above' | 'below';
  }): Promise<PriceAlert> {
    const [row] = await db
      .insert(priceAlerts)
      .values({
        userId,
        coinId: data.coin_id,
        coinSymbol: data.coin_symbol,
        targetPrice: String(data.target_price),
        direction: data.direction,
      })
      .returning();
    return mapAlert(row);
  },

  async remove(userId: string, alertId: string): Promise<boolean> {
    const result = await db
      .delete(priceAlerts)
      .where(and(eq(priceAlerts.id, alertId), eq(priceAlerts.userId, userId)));
    return result.count > 0;
  },

  async checkAndTrigger(userId: string): Promise<string[]> {
    const active = await db
      .select()
      .from(priceAlerts)
      .where(and(eq(priceAlerts.userId, userId), eq(priceAlerts.isActive, true), eq(priceAlerts.isTriggered, false)));

    if (active.length === 0) return [];

    const coinIds = [...new Set(active.map((a) => a.coinId))];
    const prices = await coingeckoService.getCoinsByIds(coinIds) as Array<{ id: string; current_price: number }>;
    const priceMap = new Map(prices.map((c) => [c.id, c.current_price]));

    const triggeredIds: string[] = [];

    for (const alert of active) {
      const current = priceMap.get(alert.coinId);
      if (current === undefined) continue;

      const target = Number(alert.targetPrice);
      const triggered = alert.direction === 'above' ? current >= target : current <= target;

      if (triggered) {
        triggeredIds.push(alert.id);
      }
    }

    if (triggeredIds.length > 0) {
      await db
        .update(priceAlerts)
        .set({ isTriggered: true, triggeredAt: new Date() })
        .where(inArray(priceAlerts.id, triggeredIds));
    }

    logger.info({ userId, triggered: triggeredIds.length }, 'Price alerts checked');
    return triggeredIds;
  },
};
