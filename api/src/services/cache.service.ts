import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false,
});

export const cacheService = {
  get<T>(key: string): T | undefined {
    return cache.get<T>(key);
  },

  set<T>(key: string, value: T, ttlSeconds = 60): void {
    cache.set(key, value, ttlSeconds);
  },

  del(key: string): void {
    cache.del(key);
  },

  has(key: string): boolean {
    return cache.has(key);
  },

  stats() {
    return cache.getStats();
  },
};
