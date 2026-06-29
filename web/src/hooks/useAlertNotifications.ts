import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { toast } from 'sonner';

type AlertState = Record<string, boolean>;

export function useAlertNotifications() {
  const prev = useRef<AlertState>({});

  useQuery({
    queryKey: ['alerts', 'check'],
    queryFn: async () => {
      const result = await apiRequest<{ triggered: string[]; rearmed: string[] }>('/alerts/check', { method: 'POST' });

      for (const id of result.triggered) {
        if (prev.current[id] === false || prev.current[id] === undefined) {
          toast('Price alert triggered', {
            description: 'A cryptocurrency has reached your target price',
            duration: 10000,
            action: { label: 'View', onClick: () => window.location.href = '/alerts' },
          });
        }
        prev.current[id] = true;
      }

      for (const id of result.rearmed) {
        if (prev.current[id] === true) {
          toast('Alert rearmed', {
            description: 'Price moved back — alert is active again',
            duration: 6000,
          });
        }
        prev.current[id] = false;
      }

      return result;
    },
    refetchInterval: 30_000,
    enabled: !!localStorage.getItem('monabit-access-token'),
  });
}
