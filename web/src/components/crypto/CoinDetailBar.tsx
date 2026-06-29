import { useTranslation } from 'react-i18next';
import { useCoinDetail } from '@/hooks/useCrypto';
import { formatCurrency, formatCompactCurrency, formatPercent, cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CoinDetailBarProps {
  coinId: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function CoinDetailBar({ coinId, isFavorite, onToggleFavorite }: CoinDetailBarProps) {
  const { t } = useTranslation();
  const { data: coin, isLoading } = useCoinDetail(coinId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-6 rounded-lg border bg-card p-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-28" />
      </div>
    );
  }

  if (!coin) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">{coin.name}</span>
            <span className="text-xs uppercase text-muted-foreground">{coin.symbol}</span>
            <span className="text-xs text-muted-foreground">#{coin.market_cap_rank}</span>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} className="ml-1 rounded-md p-1 transition-colors hover:bg-accent">
          <Star size={15} className={isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'} />
        </button>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">{t('dashboard.price')}</span>
          <p className="font-mono font-medium">{formatCurrency(coin.current_price)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">{t('dashboard.change24h')}</span>
          <p className={cn('font-mono font-medium flex items-center gap-0.5', coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500')}>
            {coin.price_change_percentage_24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {formatPercent(coin.price_change_percentage_24h)}
          </p>
        </div>
        <div className="hidden sm:block">
          <span className="text-muted-foreground">{t('dashboard.marketCap')}</span>
          <p className="font-mono font-medium">{formatCompactCurrency(coin.market_cap)}</p>
        </div>
        <div className="hidden sm:block">
          <span className="text-muted-foreground">{t('dashboard.volume24h')}</span>
          <p className="font-mono font-medium">{formatCompactCurrency(coin.total_volume)}</p>
        </div>
      </div>
    </div>
  );
}
