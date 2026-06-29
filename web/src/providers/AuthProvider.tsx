import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { apiRequest, setTokens, clearTokens } from '@/services/api';
import type { UserProfile } from '@/types';

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, username?: string, full_name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const fetchUser = useCallback(async () => {
    try {
      const data = await apiRequest<UserProfile>('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('monabit-access-token');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiRequest<{ user: UserProfile; session: { access_token: string; refresh_token: string; expires_at: number } }>(
      '/auth/login',
      { method: 'POST', data: { email, password } },
    );
    setTokens(data.session.access_token, data.session.refresh_token, data.session.expires_at);
    setUser(data.user);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const { data: authData, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });
    if (error) throw new Error(error.message);
    if (authData?.url) {
      window.location.href = authData.url;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, username?: string, full_name?: string) => {
    const data = await apiRequest<{ user: UserProfile; session: { access_token: string; refresh_token: string; expires_at: number } }>(
      '/auth/register',
      { method: 'POST', data: { email, password, username, full_name } },
    );
    setTokens(data.session.access_token, data.session.refresh_token, data.session.expires_at);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Proceed with local logout even if server call fails
    }
    await supabase.auth.signOut();
    clearTokens();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
