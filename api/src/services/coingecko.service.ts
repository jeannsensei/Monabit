import { env } from '@/config/env';
import { withRetry } from '@/utils/retry';
import { CoinGeckoError, NoRetryError } from '@/utils/errors';
import { logger } from '@/utils/logger';

const BASE_URL = env.COINGECKO_API_URL;
const API_KEY = env.COINGECKO_API_KEY;

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  ...(API_KEY && { 'x-cg-demo-api-key': API_KEY }),
};

interface FetchOptions {
  retries?: number;
}

async function fetchCoinGecko<T>(path: string, params: Record<string, string> = {}, options: FetchOptions = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  return withRetry(
    async () => {
      const response = await fetch(url.toString(), { headers });
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 60_000;
        logger.warn({ status: 429, retryAfter: waitMs }, 'CoinGecko rate limit hit — not retrying');
        throw new NoRetryError('CoinGecko rate limit exceeded');
      }
      if (!response.ok) {
        logger.error({ status: response.status, path }, 'CoinGecko API error');
        throw new CoinGeckoError(`CoinGecko API error: ${response.status}`, response.status);
      }
      return response.json() as Promise<T>;
    },
    { retries: options.retries ?? 3, baseDelay: 2000, maxDelay: 30_000 },
  );
}

export const coingeckoService = {
  async getTopCoins(limit = 10, currency = 'usd') {
    return fetchCoinGecko('/coins/markets', {
      vs_currency: currency,
      order: 'market_cap_desc',
      per_page: String(limit),
      page: '1',
      sparkline: 'true',
      price_change_percentage: '24h,7d',
    });
  },

  async getGlobalData() {
    return fetchCoinGecko('/global');
  },

  async getCoinDetail(coinId: string) {
    return fetchCoinGecko(`/coins/${coinId}`, {
      localization: 'false',
      tickers: 'false',
      community_data: 'false',
      developer_data: 'false',
      sparkline: 'true',
    });
  },

  async getCoinHistory(coinId: string, days: number) {
    return fetchCoinGecko(`/coins/${coinId}/market_chart`, {
      vs_currency: 'usd',
      days: String(days),
    });
  },

  async searchCoins(query: string) {
    return fetchCoinGecko('/search', { query });
  },

  async getCoinsByIds(ids: string[], currency = 'usd') {
    return fetchCoinGecko('/coins/markets', {
      vs_currency: currency,
      ids: ids.join(','),
      order: 'market_cap_desc',
      per_page: '250',
      sparkline: 'true',
      price_change_percentage: '24h,7d',
    });
  },
};
