import { supabase } from '@/config/supabase';
import type { FavoriteCoin } from '@/types';

export const favoritesRepository = {
  async findByUser(userId: string): Promise<FavoriteCoin[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data as FavoriteCoin[];
  },

  async add(userId: string, coinId: string, coinSymbol: string, coinName: string): Promise<FavoriteCoin | null> {
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, coin_id: coinId, coin_symbol: coinSymbol, coin_name: coinName })
      .select()
      .single();

    if (error) return null;
    return data as FavoriteCoin;
  },

  async remove(userId: string, coinId: string): Promise<boolean> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('coin_id', coinId);

    return !error;
  },
};
