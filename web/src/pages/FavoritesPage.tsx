import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import type { FavoriteCoin } from '@/types';
import { Star, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function FavoritesPage() {
  const queryClient = useQueryClient();
  const { data: favorites, isLoading, error, refetch } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => apiRequest<FavoriteCoin[]>('/favorites'),
    staleTime: 300_000,
  });

  const removeFavorite = useMutation({
    mutationFn: (coinId: string) => apiRequest(`/favorites/${coinId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Removed from favorites');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Favorites</h1>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Favorites</h1>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load favorites. <button onClick={() => refetch()} className="underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Favorites</h1>
        <p className="text-sm text-muted-foreground">Your bookmarked cryptocurrencies</p>
      </div>

      {!favorites || favorites.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Star className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No favorites yet. Search and bookmark coins from the dashboard.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((fav) => (
            <div key={fav.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
              <div>
                <p className="font-medium">{fav.coin_name}</p>
                <span className="text-xs uppercase text-muted-foreground">{fav.coin_symbol}</span>
              </div>
              <button
                onClick={() => removeFavorite.mutate(fav.coin_id)}
                className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
