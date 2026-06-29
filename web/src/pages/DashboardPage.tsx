import { useState } from 'react';
import { useTop10Crypto, useMarketOverview, usePriceHistory } from '@/hooks/useCrypto';
import { useFavorites } from '@/hooks/useFavorites';
import { CryptoTable } from '@/components/crypto/CryptoTable';
import { KPICards } from '@/components/crypto/KPICards';
import { PriceChart } from '@/components/crypto/PriceChart';
import { CoinSearch } from '@/components/crypto/CoinSearch';
import { LastUpdated } from '@/components/crypto/LastUpdated';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function DashboardPage() {
  const { data: cryptoData, isLoading: cryptoLoading, error: cryptoError, refetch: refetchCrypto } = useTop10Crypto();
  const { data: overview, isLoading: overviewLoading } = useMarketOverview();
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const { data: priceHistory, isLoading: historyLoading } = usePriceHistory(selectedCoin, 7);
  const { favoriteIds, toggle: toggleFavorite } = useFavorites();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Crypto Dashboard</h1>
          <p className="text-sm text-muted-foreground">Top 10 cryptocurrencies by market cap</p>
        </div>
        <LastUpdated timestamp={cryptoData?.last_api_fetch} />
      </div>

      {overviewLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : overview ? (
        <KPICards overview={overview} />
      ) : null}

      <CoinSearch onSelect={(coinId) => setSelectedCoin(coinId)} />

      {selectedCoin && (
        <PriceChart
          coinId={selectedCoin}
          data={priceHistory}
          isLoading={historyLoading}
          onClose={() => setSelectedCoin(null)}
        />
      )}

      {cryptoError && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle size={18} />
          <p className="flex-1 text-sm">
            {cryptoError instanceof Error ? cryptoError.message : 'Failed to load crypto data'}
          </p>
          <button
            onClick={() => refetchCrypto()}
            className="flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium hover:bg-destructive/20"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {cryptoLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : cryptoData ? (
        <CryptoTable coins={cryptoData.data} onSelectCoin={setSelectedCoin} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />
      ) : null}
    </div>
  );
}
