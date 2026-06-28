import { useState } from 'react';
import { useSearchCoins } from '@/hooks/useCrypto';
import { Search } from 'lucide-react';

export function CoinSearch({ onSelect }: { onSelect: (coinId: string) => void }) {
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
              {data.coins.slice(0, 8).map((coin) => (
                <li key={coin.id}>
                  <button
                    onClick={() => {
                      onSelect(coin.id);
                      setQuery('');
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                  >
                    <img src={coin.thumb} alt={coin.name} className="h-5 w-5 rounded-full" />
                    <span className="font-medium">{coin.name}</span>
                    <span className="uppercase text-muted-foreground">{coin.symbol}</span>
                    <span className="ml-auto text-xs text-muted-foreground">#{coin.market_cap_rank}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-2 text-sm text-muted-foreground">No results found</p>
          )}
        </div>
      )}
    </div>
  );
}
