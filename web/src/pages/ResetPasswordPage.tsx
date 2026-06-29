import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/services/supabase';
import { Loader2, CheckCircle } from 'lucide-react';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const hash = window.location.hash;

      if (hash && hash.includes('access_token=')) {
        const params = new URLSearchParams(hash.replace(/^#/, ''));
        const token = params.get('access_token');
        if (token) {
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: params.get('refresh_token') ?? '',
          });
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setReady(true);
      } else if (!hash || !hash.includes('access_token=')) {
        navigate('/login', { replace: true });
      }
    })();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError(t('auth.passwordMin8'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!ready && !done) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center space-y-4">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h1 className="text-2xl font-bold">{t('auth.passwordReset')}</h1>
          <p className="text-sm text-muted-foreground">{t('auth.passwordResetSuccess')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('auth.newPassword')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('auth.newPasswordInstructions')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium">{t('auth.password')}</label>
            <input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t('common.passwordPlaceholder')}
            />
            <p className="mt-1 text-xs text-muted-foreground">{t('auth.passwordStrength')}</p>
          </div>
          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</div>}
          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? t('auth.saving') : t('auth.resetPassword')}
          </button>
        </form>
      </div>
    </div>
  );
}
