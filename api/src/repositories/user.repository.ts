import { supabase } from '@/config/supabase';
import type { UserProfile } from '@/types';

export const userRepository = {
  async findById(id: string): Promise<UserProfile | null> {
    const { data: authData } = await supabase.auth.admin.getUserById(id);
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id,
      email: authData?.user?.email ?? undefined,
      username: profile.username,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      role: profile.role,
      is_active: profile.is_active,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  },

  async findByEmail(email: string): Promise<UserProfile | null> {
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find((u) => u.email === email);
    if (!authUser) return null;

    return this.findById(authUser.id);
  },

  async findAll(page: number, perPage: number): Promise<{ data: UserProfile[]; total: number }> {
    const { data: profiles, count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .range((page - 1) * perPage, page * perPage - 1)
      .order('created_at', { ascending: false });

    if (error || !profiles) {
      return { data: [], total: 0 };
    }

    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const emailMap = new Map<string, string>();
    authUsers?.users?.forEach((u) => {
      emailMap.set(u.id, u.email ?? '');
    });

    const users: UserProfile[] = profiles.map((p) => ({
      id: p.id,
      email: emailMap.get(p.id),
      username: p.username,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      role: p.role,
      is_active: p.is_active,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    return { data: users, total: count ?? 0 };
  },

  async update(id: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    const updateData: Record<string, unknown> = {};
    if (data.username !== undefined) updateData.username = data.username;
    if (data.full_name !== undefined) updateData.full_name = data.full_name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;

    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !profile) return null;

    return this.findById(id);
  },
};
