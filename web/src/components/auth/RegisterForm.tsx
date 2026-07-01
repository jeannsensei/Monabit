import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('emailInvalid'),
  username: z.string().optional(),
  full_name: z.string().optional(),
  password: z
    .string()
    .min(8, 'passwordMin8')
    .regex(/[A-Z]/, 'passwordUppercase')
    .regex(/[0-9]/, 'passwordNumber'),
});

type RegisterInput = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSubmit: (email: string, password: string, username?: string, full_name?: string) => Promise<void>;
  loading: boolean;
  error: string;
}

export function RegisterForm({ onSubmit, loading, error }: RegisterFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onFormSubmit = async (data: RegisterInput) => {
    await onSubmit(data.email, data.password, data.username, data.full_name);
  };

  const fe = (key: string) => {
    const msg = errors[key as keyof typeof errors]?.message;
    if (!msg) return undefined;
    const translated = t(`auth.${msg}`, { defaultValue: '' });
    return translated || t(msg, { defaultValue: msg });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium">{t('auth.email')}</label>
        <input
          id="reg-email" type="email" autoComplete="email" disabled={loading}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
          placeholder={t('common.emailPlaceholder')}
          {...register('email')}
        />
        {errors.email && <p className="mt-1 text-xs text-destructive">{fe('email')}</p>}
      </div>
      <div>
        <label htmlFor="reg-username" className="block text-sm font-medium">{t('auth.username')}</label>
        <input
          id="reg-username" type="text" disabled={loading}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
          placeholder={t('common.usernamePlaceholder')}
          {...register('username')}
        />
      </div>
      <div>
        <label htmlFor="reg-fullname" className="block text-sm font-medium">{t('auth.fullName')}</label>
        <input
          id="reg-fullname" type="text" disabled={loading}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
          placeholder={t('common.fullNamePlaceholder')}
          {...register('full_name')}
        />
      </div>
      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium">{t('auth.password')}</label>
        <input
          id="reg-password" type="password" autoComplete="new-password" disabled={loading}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
          placeholder={t('common.passwordPlaceholder')}
          {...register('password')}
        />
        {errors.password ? (
          <p className="mt-1 text-xs text-destructive">{fe('password')}</p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">{t('auth.passwordStrength')}</p>
        )}
      </div>
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</div>
      )}
      <button
        type="submit" disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? t('auth.registering') : t('auth.register')}
      </button>
    </form>
  );
}
