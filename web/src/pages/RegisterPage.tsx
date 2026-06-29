import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { GoogleButton } from '@/components/auth/GoogleButton';

export function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (email: string, password: string, username?: string, full_name?: string) => {
    setError('');
    setLoading(true);
    try {
      await register(email, password, username, full_name);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.emailExists'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
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
  );
}
