import { coingeckoService } from '@/services/coingecko.service';
import { cacheService } from '@/services/cache.service';
import { logger } from '@/utils/logger';
import type { CryptoCoin, MarketOverview, PriceHistory } from '@/types';

const CACHE_PREFIX = 'crypto:';
const CACHE_TTL = 60;

export const cryptoService = {
  async getTop10(): Promise<{ data: CryptoCoin[]; cached: boolean; cached_at?: string; last_api_fetch?: string }> {
    const cacheKey = `${CACHE_PREFIX}top10:usd:1:10`;
    const cached = cacheService.get<{ data: CryptoCoin[]; last_api_fetch: string }>(cacheKey);

    if (cached) {
      return { data: cached.data, cached: true, last_api_fetch: cached.last_api_fetch };
    }

    const coins = await coingeckoService.getTopCoins(10);
    const transformed: CryptoCoin[] = (coins as Array<Record<string, unknown>>).map((c) => ({
      id: c.id as string,
      symbol: c.symbol as string,
      name: c.name as string,
      image: c.image as string,
      current_price: c.current_price as number,
      market_cap: c.market_cap as number,
      market_cap_rank: c.market_cap_rank as number,
      total_volume: c.total_volume as number,
      high_24h: c.high_24h as number,
      low_24h: c.low_24h as number,
      price_change_percentage_24h: c.price_change_percentage_24h as number,
      price_change_percentage_7d: c.price_change_percentage_7d_in_currency as number,
      market_cap_change_percentage_24h: c.market_cap_change_percentage_24h as number,
      circulating_supply: c.circulating_supply as number,
      total_supply: c.total_supply as number | null,
      sparkline_in_7d: c.sparkline_in_7d as { price: number[] },
      last_updated: c.last_updated as string,
    }));

    const now = new Date().toISOString();
    cacheService.set(cacheKey, { data: transformed, last_api_fetch: now }, CACHE_TTL);

    logger.info('Crypto top10 cache refreshed from CoinGecko');

    return { data: transformed, cached: false, cached_at: now, last_api_fetch: now };
  },

  async getMarketOverview(): Promise<MarketOverview> {
    const cacheKey = `${CACHE_PREFIX}global`;
    const cached = cacheService.get<MarketOverview>(cacheKey);
    if (cached) return cached;

    const response = await coingeckoService.getGlobalData() as Record<string, unknown>;
    const data = response.data as Record<string, Record<string, number> | number>;

    const overview: MarketOverview = {
      total_market_cap: (data.total_market_cap as Record<string, number>)?.usd ?? 0,
      total_volume_24h: (data.total_volume as Record<string, number>)?.usd ?? 0,
      btc_dominance: (data.market_cap_percentage as Record<string, number>)?.btc ?? 0,
      eth_dominance: (data.market_cap_percentage as Record<string, number>)?.eth ?? 0,
      active_cryptocurrencies: data.active_cryptocurrencies as number ?? 0,
      market_cap_change_percentage_24h: data.market_cap_change_percentage_24h_usd as number ?? 0,
      last_updated: new Date().toISOString(),
    };

    cacheService.set(cacheKey, overview, 120);
    return overview;
  },

  async getCoinDetail(coinId: string): Promise<CryptoCoin> {
    const cacheKey = `${CACHE_PREFIX}coin:${coinId}`;
    const cached = cacheService.get<CryptoCoin>(cacheKey);
    if (cached) return cached;

    const response = await coingeckoService.getCoinDetail(coinId) as Record<string, unknown>;
    const c = response;
    const market = c.market_data as Record<string, unknown>;

    const getPrice = (key: string) => (market[key] as Record<string, number>)?.usd ?? 0;

    const coin: CryptoCoin = {
      id: c.id as string,
      symbol: c.symbol as string,
      name: c.name as string,
      image: (c.image as Record<string, string>)?.large ?? '',
      current_price: getPrice('current_price'),
      market_cap: getPrice('market_cap'),
      market_cap_rank: c.market_cap_rank as number,
      total_volume: getPrice('total_volume'),
      high_24h: getPrice('high_24h'),
      low_24h: getPrice('low_24h'),
      price_change_percentage_24h: (market.price_change_percentage_24h as number) ?? 0,
      price_change_percentage_7d: (market.price_change_percentage_7d as number) ?? 0,
      market_cap_change_percentage_24h: (market.market_cap_change_percentage_24h as number) ?? 0,
      circulating_supply: (market.circulating_supply as number) ?? 0,
      total_supply: (market.total_supply as number) ?? null,
      sparkline_in_7d: (c.sparkline_in_7d as { price: number[] }) ?? { price: [] },
      last_updated: c.last_updated as string,
    };

    cacheService.set(cacheKey, coin, CACHE_TTL);
    return coin;
  },

  async getCoinHistory(coinId: string, days: number): Promise<PriceHistory> {
    const cacheKey = `${CACHE_PREFIX}history:${coinId}:${days}`;
    const cached = cacheService.get<PriceHistory>(cacheKey);
    if (cached) return cached;

    const response = await coingeckoService.getCoinHistory(coinId, days) as Record<string, number[][]>;

    const history: PriceHistory = {
      coin_id: coinId,
      days,
      prices: (response.prices ?? []) as [number, number][],
      market_caps: (response.market_caps ?? []) as [number, number][],
      total_volumes: (response.total_volumes ?? []) as [number, number][],
    };

    cacheService.set(cacheKey, history, 300);
    return history;
  },

  async searchCoins(query: string) {
    const cacheKey = `${CACHE_PREFIX}search:${query}`;
    const cached = cacheService.get<{ coins: unknown[] }>(cacheKey);
    if (cached) return cached;

    const response = await coingeckoService.searchCoins(query);
    cacheService.set(cacheKey, response, 120);
    return response;
  },
};
