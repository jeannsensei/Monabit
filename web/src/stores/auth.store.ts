import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import { apiRequest, setTokens, clearTokens } from '@/services/api';
import type { UserProfile } from '@/types';

interface AuthStore {
  user: UserProfile | null;
  isLoading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, username?: string, full_name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    const token = localStorage.getItem('monabit-access-token');
    if (!token) {
      set({ isLoading: false, initialized: true });
      return;
    }
    try {
      const data = await apiRequest<UserProfile>('/auth/me');
      set({ user: data, isLoading: false, initialized: true });
    } catch (err) {
      console.error('[auth] initialize failed:', err);
      if (!localStorage.getItem('monabit-access-token')) {
        clearTokens();
      }
      set({ user: null, isLoading: false, initialized: true });
    }
  },

  login: async (email, password) => {
    const data = await apiRequest<{
      user: UserProfile;
      session: { access_token: string; refresh_token: string; expires_at: number };
    }>('/auth/login', { method: 'POST', data: { email, password } });
    setTokens(data.session.access_token, data.session.refresh_token, data.session.expires_at);
    set({ user: data.user });
  },

  loginWithGoogle: async () => {
    const { data: authData, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) throw new Error(error.message);
    if (authData?.url) {
      window.location.href = authData.url;
    }
  },

  register: async (email, password, username, full_name) => {
    const data = await apiRequest<{
      user: UserProfile;
      session: { access_token: string; refresh_token: string; expires_at: number };
    }>('/auth/register', { method: 'POST', data: { email, password, username, full_name } });
    setTokens(data.session.access_token, data.session.refresh_token, data.session.expires_at);
    set({ user: data.user });
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // proceed even if server call fails
    }
    await supabase.auth.signOut();
    clearTokens();
    set({ user: null });
  },

  refreshUser: async () => {
    const token = localStorage.getItem('monabit-access-token');
    if (token) {
      try {
        const data = await apiRequest<UserProfile>('/auth/me');
        set({ user: data, isLoading: false });
      } catch {
        clearTokens();
        set({ user: null, isLoading: false });
      }
    } else {
      set({ user: null, isLoading: false });
    }
  },
}));

export const useAuth = () => useAuthStore();
