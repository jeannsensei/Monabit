import { supabase } from '@/config/supabase';
import { userRepository } from '@/repositories';
import { logger } from '@/utils/logger';
import type { UserProfile } from '@/types';

function attachEmail(profile: UserProfile | null, email: string | undefined) {
  if (!profile) return null;
  return { ...profile, email };
}

export const authService = {
  async register(email: string, password: string, username?: string, full_name?: string) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, full_name },
    });

    if (error) {
      logger.error({ error }, 'Failed to register user');
      if (error.message.includes('already')) {
        return { error: 'A user with this email already exists' };
      }
      return { error: error.message };
    }

    const profile = await userRepository.findById(data.user.id);

    return { user: attachEmail(profile, data.user.email), session: null };
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    const profile = await userRepository.findById(data.user.id);

    if (!profile || !profile.is_active) {
      return { error: 'Account is deactivated' };
    }

    return {
      user: attachEmail(profile, data.user.email),
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    };
  },

  async loginWithGoogle(idToken: string) {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      return { error: error.message };
    }

    const profile = await userRepository.findById(data.user.id);

    if (!profile || !profile.is_active) {
      return { error: 'Account is deactivated' };
    }

    return {
      user: attachEmail(profile, data.user.email),
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    };
  },

  async logout(accessToken: string) {
    const { error } = await supabase.auth.admin.signOut(accessToken);
    if (error) {
      return { error: error.message };
    }
    return { success: true };
  },

  async getUser(token: string) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }

    const profile = await userRepository.findById(data.user.id);
    if (!profile) return null;

    return attachEmail(profile, data.user.email);
  },

  async refreshSession(refreshToken: string) {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      return { error: error.message };
    }

    const { session } = data;
    if (!session) {
      return { error: 'No session returned' };
    }
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
    };
  },
};
