import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { toast } from 'sonner';
import type { FavoriteCoin } from '@/types';

export function useFavorites() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['favorites'],
    queryFn: () => apiRequest<FavoriteCoin[]>('/favorites'),
    staleTime: 60_000,
  });

  const addMutation = useMutation({
    mutationFn: (coin: { coin_id: string; coin_symbol: string; coin_name: string }) =>
      apiRequest<FavoriteCoin>('/favorites', { method: 'POST', data: coin }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Added to favorites');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: (coinId: string) =>
      apiRequest(`/favorites/${coinId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Removed from favorites');
    },
    onError: (err: Error) => toast.error(err.message),
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
