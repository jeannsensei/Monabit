import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth.store';
import { apiRequest } from '@/services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/types';

const profileSchema = z.object({
  username: z.string().optional(),
  full_name: z.string().optional(),
});

type ProfileInput = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: { username: user?.username ?? '', full_name: user?.full_name ?? '' },
  });

  if (isLoading || !user) return null;

  const onSubmit = async (data: ProfileInput) => {
    try {
      const updated = await apiRequest<UserProfile>('/profile', { method: 'PUT', data });
      useAuthStore.setState({ user: updated });
      toast.success(t('profile.updated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('profile.updateFailed'));
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('profile.subtitle')}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-card p-6" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">{t('auth.email')}</label>
          <input id="email" type="email" value={user.email ?? ''} disabled className="mt-1 block w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground" />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium">{t('auth.username')}</label>
          <input id="username" type="text" disabled={isSubmitting} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" {...register('username')} />
          {errors.username && <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>}
        </div>
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium">{t('auth.fullName')}</label>
          <input id="full_name" type="text" disabled={isSubmitting} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" {...register('full_name')} />
          {errors.full_name && <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {isSubmitting && <Loader2 size={14} className="animate-spin" />}
          {isSubmitting ? t('profile.saving') : t('profile.saveChanges')}
        </button>
      </form>
    </div>
  );
}
