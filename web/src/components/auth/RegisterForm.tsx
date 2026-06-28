import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().optional(),
  full_name: z.string().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

type RegisterInput = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSubmit: (email: string, password: string, username?: string, full_name?: string) => Promise<void>;
  loading: boolean;
  error: string;
}

export function RegisterForm({ onSubmit, loading, error }: RegisterFormProps) {
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

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
          placeholder="you@example.com"
          disabled={loading}
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="reg-username" className="block text-sm font-medium">
          Username
        </label>
        <input
          id="reg-username"
          type="text"
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
          placeholder="crypto_trader"
          disabled={loading}
          {...register('username')}
        />
      </div>

      <div>
        <label htmlFor="reg-fullname" className="block text-sm font-medium">
          Full Name
        </label>
        <input
          id="reg-fullname"
          type="text"
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
          placeholder="Satoshi Nakamoto"
          disabled={loading}
          {...register('full_name')}
        />
      </div>

      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
          placeholder="••••••••"
          disabled={loading}
          {...register('password')}
        />
        {errors.password ? (
          <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            At least 8 characters, one uppercase letter, one number
          </p>
        )}
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
        {loading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}
