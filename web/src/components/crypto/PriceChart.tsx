import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { usePriceHistory } from '@/hooks/useCrypto';
import { formatCurrency, cn } from '@/lib/utils';
import { X } from 'lucide-react';

const RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '1y', days: 365 },
] as const;

function formatChartDate(timestamp: number, days: number): string {
  const d = new Date(timestamp);
  if (days <= 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric' });
  }
  if (days <= 30) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function formatTooltipDate(timestamp: number, days: number): string {
  const d = new Date(timestamp);
  if (days <= 7) {
    return d.toLocaleDateString('en-US', {
      weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  }
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function ChartSkeleton() {
  return (
    <div className="flex h-64 items-end gap-1 px-2">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 animate-pulse rounded-t bg-muted"
          style={{ height: `${30 + Math.random() * 70}%` }}
        />
      ))}
    </div>
  );
}

interface PriceChartProps {
  coinId: string;
  onClose: () => void;
}

export function PriceChart({ coinId, onClose }: PriceChartProps) {
  const [days, setDays] = useState(7);
  const { data, isLoading } = usePriceHistory(coinId, days);

  const chartData = data?.prices.map(([timestamp, price]) => ({
    date: formatChartDate(timestamp, days),
    rawTs: timestamp,
    price,
  })) ?? [];

  const tickInterval = Math.max(1, Math.floor(chartData.length / (days <= 7 ? 7 : days <= 30 ? 6 : 12)));

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold capitalize">{coinId} Price Chart</h2>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-md border text-xs">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={cn(
                  'px-3 py-1 transition-colors',
                  days === r.days
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:bg-accent',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-accent">
            <X size={18} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <ChartSkeleton />
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={256}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={tickInterval}
            />
            <YAxis
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCurrency(v)}
              width={80}
              domain={['auto', 'auto']}
            />
            <Tooltip
              labelFormatter={(_, payload) => payload[0]?.payload?.rawTs
                ? formatTooltipDate(payload[0].payload.rawTs, days)
                : ''}
              formatter={(value: number) => [formatCurrency(value), 'Price']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No chart data available
        </div>
      )}
    </div>
  );
}
