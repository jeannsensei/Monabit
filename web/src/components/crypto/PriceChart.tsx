import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { X } from 'lucide-react';
import type { PriceHistory } from '@/types';

interface PriceChartProps {
  coinId: string;
  data: PriceHistory | undefined;
  isLoading: boolean;
  onClose: () => void;
}

export function PriceChart({ coinId, data, isLoading, onClose }: PriceChartProps) {
  const chartData = data?.prices.map(([timestamp, price]) => ({
    date: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price,
  })) ?? [];

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold capitalize">
          {coinId} — 7 Day Price Chart
        </h2>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-accent">
          <X size={18} />
        </button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={256}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCurrency(v)}
              width={80}
            />
            <Tooltip
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
        <p className="py-8 text-center text-sm text-muted-foreground">No chart data available</p>
      )}
    </div>
  );
}
