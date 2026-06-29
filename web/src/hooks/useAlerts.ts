import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { toast } from 'sonner';
import type { PriceAlert } from '@/types';

export function useAlerts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['alerts'],
    queryFn: () => apiRequest<PriceAlert[]>('/alerts'),
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: { coin_id: string; coin_symbol: string; target_price: number; direction: 'above' | 'below' }) =>
      apiRequest<PriceAlert>('/alerts', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Price alert created');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; target_price?: number; direction?: 'above' | 'below' }) =>
      apiRequest<PriceAlert>(`/alerts/${id}`, { method: 'PUT', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Price alert updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/alerts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert removed');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    alerts: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    remove: removeMutation.mutate,
  };
}
