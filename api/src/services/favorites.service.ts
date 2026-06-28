import { favoritesRepository } from '@/repositories/favorites.repository';
import type { FavoriteCoin } from '@/types';

export const favoritesService = {
  async list(userId: string): Promise<FavoriteCoin[]> {
    return favoritesRepository.findByUser(userId);
  },

  async add(userId: string, coinId: string, coinSymbol: string, coinName: string): Promise<FavoriteCoin> {
    const existing = await favoritesRepository.findByUser(userId);
    const alreadyExists = existing.find((f) => f.coin_id === coinId);
    if (alreadyExists) return alreadyExists;

    const fav = await favoritesRepository.add(userId, coinId, coinSymbol, coinName);
    if (!fav) throw new Error('Failed to add favorite');
    return fav;
  },

  async remove(userId: string, coinId: string): Promise<void> {
    const removed = await favoritesRepository.remove(userId, coinId);
    if (!removed) throw new Error('Failed to remove favorite');
  },
};
