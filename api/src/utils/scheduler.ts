import cron from 'node-cron';
import { cryptoService } from '@/services/crypto.service';
import { logger } from '@/utils/logger';

let task: cron.ScheduledTask | null = null;

export function startScheduler() {
  task = cron.schedule('0 */5 * * * *', async () => {
    try {
      await cryptoService.getTop10();
      await cryptoService.getMarketOverview();
      logger.debug('Crypto cache refreshed via scheduler');
    } catch (error) {
      logger.error({ error }, 'Scheduler failed to refresh crypto cache');
    }
  });

  logger.info('Crypto cache scheduler started (every 5 min)');
}

export function stopScheduler() {
  task?.stop();
}
