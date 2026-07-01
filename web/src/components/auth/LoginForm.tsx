import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('emailInvalid'),
  password: z.string().min(6, 'passwordMin'),
});

type LoginInput = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string;
}

export function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onFormSubmit = async (data: LoginInput) => {
    await onSubmit(data.email, data.password);
  };

  const fieldError = (key: string) => {
    const msg = errors[key as keyof typeof errors]?.message;
    if (!msg) return undefined;
    const translated = t(`auth.${msg}`, { defaultValue: '' });
    return translated || t(msg, { defaultValue: msg });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          {t('auth.email')}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
          placeholder={t('common.emailPlaceholder')}
          disabled={loading}
          {...register('email')}
        />
        {errors.email && <p className="mt-1 text-xs text-destructive">{fieldError('email')}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          {t('auth.password')}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
          placeholder={t('common.passwordPlaceholder')}
          disabled={loading}
          {...register('password')}
        />
        {errors.password && <p className="mt-1 text-xs text-destructive">{fieldError('password')}</p>}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? t('auth.signingIn') : t('auth.signIn')}
      </button>
    </form>
  );
}
