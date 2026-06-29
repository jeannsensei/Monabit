import { formatCurrency, formatCompactCurrency, formatPercent, cn } from '@/lib/utils';
import type { CryptoCoin } from '@/types';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';

interface CryptoTableProps {
  coins: CryptoCoin[];
  onSelectCoin: (coinId: string) => void;
  favoriteIds: Set<string>;
  onToggleFavorite: (coin: { coin_id: string; coin_symbol: string; coin_name: string }) => void;
}

export function CryptoTable({ coins, onSelectCoin, favoriteIds, onToggleFavorite }: CryptoTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="w-10 px-2 py-3 text-center font-medium"></th>
            <th className="px-4 py-3 text-left font-medium">#</th>
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-right font-medium">Price</th>
            <th className="px-4 py-3 text-right font-medium">24h %</th>
            <th className="px-4 py-3 text-right font-medium hidden md:table-cell">7d %</th>
            <th className="px-4 py-3 text-right font-medium hidden lg:table-cell">Market Cap</th>
            <th className="px-4 py-3 text-right font-medium hidden lg:table-cell">Volume (24h)</th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => {
            const isFav = favoriteIds.has(coin.id);
            return (
              <tr
                key={coin.id}
                onClick={() => onSelectCoin(coin.id)}
                className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
              >
                <td className="px-2 py-3 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite({
                        coin_id: coin.id,
                        coin_symbol: coin.symbol,
                        coin_name: coin.name,
                      });
                    }}
                    className="rounded-md p-1 transition-colors hover:bg-accent"
                  >
                    <Star
                      size={15}
                      className={isFav
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-muted-foreground'
                      }
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{coin.market_cap_rank}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" />
                    <div>
                      <span className="font-medium">{coin.name}</span>
                      <span className="ml-1.5 text-xs uppercase text-muted-foreground">{coin.symbol}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(coin.current_price)}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 font-mono',
                      coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500',
                    )}
                  >
                    {coin.price_change_percentage_24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {formatPercent(coin.price_change_percentage_24h)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono hidden md:table-cell">
                  <span className={coin.price_change_percentage_7d >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatPercent(coin.price_change_percentage_7d)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono hidden lg:table-cell">
                  {formatCompactCurrency(coin.market_cap)}
                </td>
                <td className="px-4 py-3 text-right font-mono hidden lg:table-cell">
                  {formatCompactCurrency(coin.total_volume)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
