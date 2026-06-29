import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { toast } from 'sonner';
import type { FavoriteCoin } from '@/types';

const FAVORITES_KEY = ['favorites'];

function optimistAdd(cache: FavoriteCoin[], coin: { coin_id: string; coin_symbol: string; coin_name: string }): FavoriteCoin[] {
  return [{ id: `opt-${coin.coin_id}`, user_id: '', coin_id: coin.coin_id, coin_symbol: coin.coin_symbol, coin_name: coin.coin_name, created_at: new Date().toISOString() }, ...cache];
}

function optimistRemove(cache: FavoriteCoin[], coinId: string): FavoriteCoin[] {
  return cache.filter((f) => f.coin_id !== coinId);
}

export function useFavorites() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: FAVORITES_KEY,
    queryFn: () => apiRequest<FavoriteCoin[]>('/favorites'),
    staleTime: 60_000,
  });

  const addMutation = useMutation({
    mutationFn: (coin: { coin_id: string; coin_symbol: string; coin_name: string }) =>
      apiRequest<FavoriteCoin>('/favorites', { method: 'POST', data: coin }),
    onMutate: async (coin) => {
      await queryClient.cancelQueries({ queryKey: FAVORITES_KEY });
      const prev = queryClient.getQueryData<FavoriteCoin[]>(FAVORITES_KEY);
      queryClient.setQueryData<FavoriteCoin[]>(FAVORITES_KEY, (old) => optimistAdd(old ?? [], coin));
      return { prev };
    },
    onError: (_err, _coin, context) => {
      queryClient.setQueryData(FAVORITES_KEY, context?.prev);
      toast.error('Failed to add favorite');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (coinId: string) =>
      apiRequest(`/favorites/${coinId}`, { method: 'DELETE' }),
    onMutate: async (coinId) => {
      await queryClient.cancelQueries({ queryKey: FAVORITES_KEY });
      const prev = queryClient.getQueryData<FavoriteCoin[]>(FAVORITES_KEY);
      queryClient.setQueryData<FavoriteCoin[]>(FAVORITES_KEY, (old) => optimistRemove(old ?? [], coinId));
      return { prev };
    },
    onError: (_err, _coinId, context) => {
      queryClient.setQueryData(FAVORITES_KEY, context?.prev);
      toast.error('Failed to remove favorite');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
    },
  });

  const favoriteIds = new Set((query.data ?? []).map((f) => f.coin_id));

  const isFavorite = (coinId: string) => favoriteIds.has(coinId);

  const toggle = (coin: { coin_id: string; coin_symbol: string; coin_name: string }) => {
    if (isFavorite(coin.coin_id)) {
      removeMutation.mutate(coin.coin_id);
    } else {
      addMutation.mutate(coin);
    }
  };

  return {
    favorites: query.data ?? [],
    favoriteIds,
    isFavorite,
    toggle,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
