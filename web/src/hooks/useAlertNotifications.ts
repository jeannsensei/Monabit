import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { toast } from 'sonner';
import type { PriceAlert } from '@/types';

const notified = new Set<string>();

export function useAlertNotifications() {
  const prevRef = useRef<Map<string, boolean>>(new Map());

  const { data: alerts } = useQuery({
    queryKey: ['alerts', 'notifications'],
    queryFn: async () => {
      await apiRequest<{ triggered: string[] }>('/alerts/check', { method: 'POST' });
      return apiRequest<PriceAlert[]>('/alerts');
    },
    refetchInterval: 30_000,
    enabled: !!localStorage.getItem('monabit-access-token'),
  });

  useEffect(() => {
    if (!alerts) return;
    for (const alert of alerts) {
      const key = alert.id;
      const was = prevRef.current.get(key);

      if (alert.is_triggered && was === false && !notified.has(key)) {
        notified.add(key);
        toast(
          `${alert.coin_symbol.toUpperCase()} ${alert.direction === 'above' ? 'exceeded' : 'fell below'} $${Number(alert.target_price).toLocaleString()}`,
          {
            description: 'Your price alert has been triggered',
            duration: 8000,
          },
        );
      }
      prevRef.current.set(key, alert.is_triggered);
    }
  }, [alerts]);
}
