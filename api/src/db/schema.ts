import {
  pgTable,
  uuid,
  text,
  boolean,
  jsonb,
  timestamp,
  decimal,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  username: text('username').unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
  isActive: boolean('is_active').notNull().default(true),
  preferences: jsonb('preferences').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_profiles_role').on(table.role),
  index('idx_profiles_username').on(table.username),
]);

export const favorites = pgTable('favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  coinId: text('coin_id').notNull(),
  coinSymbol: text('coin_symbol').notNull(),
  coinName: text('coin_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('idx_favorites_user_coin').on(table.userId, table.coinId),
  index('idx_favorites_user_id').on(table.userId),
]);

export const priceAlerts = pgTable('price_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  coinId: text('coin_id').notNull(),
  coinSymbol: text('coin_symbol').notNull(),
  targetPrice: decimal('target_price').notNull(),
  direction: text('direction', { enum: ['above', 'below'] }).notNull(),
  isTriggered: boolean('is_triggered').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  triggeredAt: timestamp('triggered_at', { withTimezone: true }),
}, (table) => [
  index('idx_price_alerts_user_id').on(table.userId),
    index('idx_price_alerts_active').on(table.isActive).where(sql`${table.isActive} = true`),
]);

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  resource: text('resource').notNull(),
  resourceId: text('resource_id'),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_audit_logs_user_id').on(table.userId),
  index('idx_audit_logs_action').on(table.action),
  index('idx_audit_logs_created_at').on(table.createdAt.desc()),
]);
