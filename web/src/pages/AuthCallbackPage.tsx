import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { apiRequest } from '@/services/api';
import type { UserProfile } from '@/types';
import { Loader2 } from 'lucide-react';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const store = useAuthStore();
  const timedOut = useRef(false);

  useEffect(() => {
    if (!store.initialized) return;
    navigate(store.user ? '/' : '/login', { replace: true });
  }, [store.initialized, store.user, navigate]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (store.initialized) return;
      timedOut.current = true;

      const token = localStorage.getItem('monabit-access-token');
      if (token) {
        try {
          const user = await apiRequest<UserProfile>('/auth/me');
          useAuthStore.setState({ user, isLoading: false, initialized: true });
          navigate('/', { replace: true });
          return;
        } catch {}
      }
      navigate('/login', { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [store.initialized, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
