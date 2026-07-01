import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { UserProfile, PaginatedResponse } from '@/types';

export function useUsers(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ['admin', 'users', page, perPage],
    queryFn: () => apiRequest<PaginatedResponse<UserProfile>>(`/admin/users?page=${page}&per_page=${perPage}`),
    staleTime: 300_000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; password: string; username?: string; full_name?: string; role?: string }) =>
      apiRequest<UserProfile>('/admin/users', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; username?: string; full_name?: string; role?: string; is_active?: boolean }) =>
      apiRequest<UserProfile>(`/admin/users/${id}`, { method: 'PUT', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ message: string; user: UserProfile }>(`/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      const key = data.message === 'activated' ? 'admin.userActivated' : 'admin.userDeactivated';
      toast.success(t(key));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useHardDeleteUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ message: string }>(`/admin/users/${id}/hard`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(t('admin.userHardDeleted'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      apiRequest(`/admin/users/${id}/reset-password`, { method: 'POST', data: { password } }),
    onSuccess: () => {
      toast.success('Password updated');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
