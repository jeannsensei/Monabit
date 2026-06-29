import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import type { CryptoCoin, MarketOverview, PriceHistory, CoinSearchResult, CryptoResponse } from '@/types';

export function useTop10Crypto() {
  return useQuery({
    queryKey: ['crypto', 'top10'],
    queryFn: () => apiRequest<CryptoResponse<CryptoCoin[]>>('/crypto/top10'),
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 3,
  });
}

export function useMarketOverview() {
  return useQuery({
    queryKey: ['crypto', 'overview'],
    queryFn: () => apiRequest<MarketOverview>('/crypto/market-overview'),
    staleTime: 120_000,
    refetchInterval: 120_000,
  });
}

export function useCoinDetail(coinId: string | null) {
  return useQuery({
    queryKey: ['crypto', 'coin', coinId],
    queryFn: () => apiRequest<CryptoCoin>(`/crypto/${coinId}`),
    enabled: !!coinId,
    staleTime: 60_000,
  });
}

export function usePriceHistory(coinId: string | null, days: number = 7) {
  return useQuery({
    queryKey: ['crypto', 'history', coinId, days],
    queryFn: () => apiRequest<PriceHistory>(`/crypto/${coinId}/history?days=${days}`),
    enabled: !!coinId,
    staleTime: 300_000,
  });
}

export function useSearchCoins(query: string) {
  return useQuery({
    queryKey: ['crypto', 'search', query],
    queryFn: () => apiRequest<{ coins: CoinSearchResult[] }>(`/crypto/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
    staleTime: 120_000,
  });
}

export function useCoinsByIds(ids: string[]) {
  const sorted = [...ids].sort();
  return useQuery({
    queryKey: ['crypto', 'by-ids', sorted],
    queryFn: () => apiRequest<CryptoCoin[]>(`/crypto/by-ids?ids=${sorted.join(',')}`),
    enabled: ids.length > 0,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
