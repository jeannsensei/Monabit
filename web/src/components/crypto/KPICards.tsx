import { DollarSign, BarChart3, Globe, Activity } from 'lucide-react';
import { formatCompactCurrency, formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { MarketOverview } from '@/types';

interface KPICardsProps {
  overview: MarketOverview;
}

export function KPICards({ overview }: KPICardsProps) {
  const cards = [
    {
      label: 'Total Market Cap',
      value: formatCompactCurrency(overview.total_market_cap),
      change: overview.market_cap_change_percentage_24h,
      icon: DollarSign,
    },
    {
      label: '24h Volume',
      value: formatCompactCurrency(overview.total_volume_24h),
      icon: BarChart3,
    },
    {
      label: 'BTC Dominance',
      value: `${overview.btc_dominance.toFixed(1)}%`,
      icon: Globe,
    },
    {
      label: 'Active Cryptocurrencies',
      value: overview.active_cryptocurrencies.toLocaleString(),
      icon: Activity,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{card.label}</span>
            <card.icon size={18} className="text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">{card.value}</p>
          {card.change != null && (
            <p className={cn('mt-1 text-xs font-medium', card.change >= 0 ? 'text-green-500' : 'text-red-500')}>
              {formatPercent(card.change)} (24h)
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
