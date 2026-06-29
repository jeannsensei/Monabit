import { useState } from 'react';
import { useSearchCoins } from '@/hooks/useCrypto';
import { Search, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoinSearchProps {
  onSelect: (coinId: string) => void;
  favoriteIds: Set<string>;
  onToggleFavorite: (coin: { coin_id: string; coin_symbol: string; coin_name: string }) => void;
}

export function CoinSearch({ onSelect, favoriteIds, onToggleFavorite }: CoinSearchProps) {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useSearchCoins(query);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cryptocurrencies..."
          className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {query.length >= 2 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-card shadow-lg">
          {isLoading ? (
            <p className="px-4 py-2 text-sm text-muted-foreground">Searching...</p>
          ) : data?.coins && data.coins.length > 0 ? (
            <ul>
              {data.coins.slice(0, 8).map((coin) => {
                const isFav = favoriteIds.has(coin.id);
                return (
                  <li key={coin.id} className="flex items-center px-4 py-2 hover:bg-accent">
                    <button
                      onClick={() => {
                        onSelect(coin.id);
                        setQuery('');
                      }}
                      className="flex flex-1 items-center gap-2 text-sm text-left"
                    >
                      <img src={coin.thumb} alt={coin.name} className="h-5 w-5 rounded-full" />
                      <span className="font-medium">{coin.name}</span>
                      <span className="uppercase text-muted-foreground">{coin.symbol}</span>
                      <span className="ml-auto text-xs text-muted-foreground">#{coin.market_cap_rank}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite({
                          coin_id: coin.id,
                          coin_symbol: coin.symbol,
                          coin_name: coin.name,
                        });
                      }}
                      className="ml-2 rounded-md p-1 transition-colors hover:bg-accent"
                    >
                      <Star
                        size={15}
                        className={cn(
                          isFav ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground',
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-2 text-sm text-muted-foreground">No results found</p>
          )}
        </div>
      )}
    </div>
  );
}
