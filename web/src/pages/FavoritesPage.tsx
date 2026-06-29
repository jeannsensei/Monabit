import { useState } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { useCoinsByIds, usePriceHistory } from '@/hooks/useCrypto';
import { CryptoTable } from '@/components/crypto/CryptoTable';
import { PriceChart } from '@/components/crypto/PriceChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, AlertCircle } from 'lucide-react';

export function FavoritesPage() {
  const { favorites, favoriteIds, toggle: toggleFavorite, isLoading: favsLoading } = useFavorites();
  const coinIds = favorites.map((f) => f.coin_id);
  const { data: coins, isLoading: coinsLoading, error } = useCoinsByIds(coinIds);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const { data: priceHistory, isLoading: historyLoading } = usePriceHistory(selectedCoin, 7);

  if (favsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Favorites</h1>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Favorites</h1>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16">
          <Star className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">
            No favorites yet. Star coins from the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Favorites</h1>
        <span className="text-sm text-muted-foreground">({favorites.length} coins)</span>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle size={14} className="inline mr-1" />
          Failed to load price data
        </div>
      )}

      {selectedCoin && (
        <PriceChart
          coinId={selectedCoin}
          data={priceHistory}
          isLoading={historyLoading}
          onClose={() => setSelectedCoin(null)}
        />
      )}

      {coinsLoading ? (
        <div className="space-y-2">
          {Array.from({ length: favorites.length }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : coins ? (
        <CryptoTable coins={coins} onSelectCoin={setSelectedCoin} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />
      ) : null}
    </div>
  );
}
