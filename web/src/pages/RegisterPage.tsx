import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/stores/app.store';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { toast } from 'sonner';
import { Moon, Sun } from 'lucide-react';

export function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useAppStore();

  const handleRegister = async (email: string, password: string, username?: string, full_name?: string) => {
    setError('');
    setLoading(true);
    try {
      await register(email, password, username, full_name);
      toast.success(t('auth.registeredSuccess'));
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.emailExists'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-4">
      <div className="flex items-center justify-end gap-2 p-4">
        <LanguageSwitcher />
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">{t('app.title')}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t('auth.registerTitle')}</p>
          </div>

          <RegisterForm onSubmit={handleRegister} loading={loading} error={error} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t('common.or')}</span>
            </div>
          </div>

          <GoogleButton />

          <p className="text-center text-sm text-muted-foreground">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              {t('auth.signInLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
