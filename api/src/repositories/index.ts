import { eq, sql, count, and } from 'drizzle-orm';
import { db } from '@/db';
import { profiles, favorites, auditLogs } from '@/db/schema';
import type { UserProfile, FavoriteCoin, AuditLogInput } from '@/types';

function mapProfile(row: typeof profiles.$inferSelect): UserProfile {
  return {
    id: row.id,
    username: row.username,
    full_name: row.fullName,
    avatar_url: row.avatarUrl,
    role: row.role as 'admin' | 'user',
    is_active: row.isActive,
    preferences: row.preferences as Record<string, unknown>,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

function mapFavorite(row: typeof favorites.$inferSelect): FavoriteCoin {
  return {
    id: row.id,
    user_id: row.userId,
    coin_id: row.coinId,
    coin_symbol: row.coinSymbol,
    coin_name: row.coinName,
    created_at: row.createdAt.toISOString(),
  };
}

export const userRepository = {
  async findById(id: string): Promise<UserProfile | null> {
    const [row] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);

    return row ? mapProfile(row) : null;
  },

  async findAll(page: number, perPage: number): Promise<{ data: UserProfile[]; total: number }> {
    const offset = (page - 1) * perPage;

    const [countResult] = await db
      .select({ total: count() })
      .from(profiles);

    const rows = await db
      .select()
      .from(profiles)
      .orderBy(sql`${profiles.createdAt} DESC`)
      .offset(offset)
      .limit(perPage);

    return {
      data: rows.map(mapProfile),
      total: countResult?.total ?? 0,
    };
  },

  async update(id: string, data: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
    role?: 'admin' | 'user';
    is_active?: boolean;
    preferences?: Record<string, unknown>;
  }): Promise<UserProfile | null> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (data.username !== undefined) updateData.username = data.username;
    if (data.full_name !== undefined) updateData.fullName = data.full_name;
    if (data.avatar_url !== undefined) updateData.avatarUrl = data.avatar_url;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.is_active !== undefined) updateData.isActive = data.is_active;
    if (data.preferences !== undefined) updateData.preferences = data.preferences;

    if (Object.keys(updateData).length <= 1) {
      return this.findById(id);
    }

    await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.id, id));

    return this.findById(id);
  },
};

export const favoritesRepository = {
  async findByUser(userId: string): Promise<FavoriteCoin[]> {
    const rows = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(sql`${favorites.createdAt} DESC`);

    return rows.map(mapFavorite);
  },

  async add(userId: string, coinId: string, coinSymbol: string, coinName: string): Promise<FavoriteCoin | null> {
    const [row] = await db
      .insert(favorites)
      .values({ userId, coinId, coinSymbol, coinName })
      .onConflictDoNothing()
      .returning();

    if (!row) {
      const [existing] = await db
        .select()
        .from(favorites)
        .where(and(eq(favorites.userId, userId), eq(favorites.coinId, coinId)))
        .limit(1);
      return existing ? mapFavorite(existing) : null;
    }

    return mapFavorite(row);
  },

  async remove(userId: string, coinId: string): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.coinId, coinId)));

    return result.count > 0;
  },
};

export const auditRepository = {
  async create(data: AuditLogInput): Promise<void> {
    await db.insert(auditLogs).values({
      userId: data.user_id,
      action: data.action,
      resource: data.resource,
      resourceId: data.resource_id ?? null,
      details: data.details ?? null,
      ipAddress: data.ip_address ?? null,
    });
  },
};
