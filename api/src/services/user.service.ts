import { userRepository, auditRepository } from '@/repositories';
import { authService } from '@/services/auth.service';
import { supabase } from '@/config/supabase';
import { NotFoundError, ConflictError, ForbiddenError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import type { UserProfile } from '@/types';

export const userService = {
  async list(page: number, perPage: number) {
    const { data, total } = await userRepository.findAll(page, perPage);
    return { data, pagination: { page, per_page: perPage, total, total_pages: Math.ceil(total / perPage) } };
  },

  async getById(id: string): Promise<UserProfile> {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User');
    return user;
  },

  async create(adminId: string, data: { email: string; password: string; username?: string; full_name?: string; role?: string }, ip: string) {
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const existing = authUsers?.users?.find((u) => u.email === data.email);
    if (existing) throw new ConflictError('A user with this email already exists');

    const result = await authService.register(data.email, data.password, data.username, data.full_name);
    if (result.error || !result.user) {
      throw new ConflictError(result.error ?? 'Failed to create user');
    }

    const newUser = result.user as UserProfile & { email?: string };

    if (data.role === 'admin' && newUser.id) {
      await userRepository.update(newUser.id, { role: 'admin' });
    }

    await auditRepository.create({
      user_id: adminId,
      action: 'user.create',
      resource: 'user',
      resource_id: newUser.id,
      details: { email: data.email, role: data.role ?? 'user' },
      ip_address: ip,
    });

    logger.info({ adminId, newUserId: newUser.id }, 'Admin created new user');
    return newUser;
  },

  async update(adminId: string, targetId: string, data: { username?: string; full_name?: string; role?: 'admin' | 'user'; is_active?: boolean }, ip: string) {
    const user = await userRepository.findById(targetId);
    if (!user) throw new NotFoundError('User');

    if (adminId === targetId && data.role !== undefined) {
      throw new ForbiddenError('Cannot change your own role');
    }

    const oldValues = { username: user.username, full_name: user.full_name, role: user.role, is_active: user.is_active };
    const updated = await userRepository.update(targetId, data);
    if (!updated) throw new NotFoundError('User');

    await auditRepository.create({
      user_id: adminId,
      action: 'user.update',
      resource: 'user',
      resource_id: targetId,
      details: { old: oldValues, new: data },
      ip_address: ip,
    });

    logger.info({ adminId, targetId, changes: data }, 'Admin updated user');
    return updated;
  },

  async deactivate(adminId: string, targetId: string, ip: string) {
    if (adminId === targetId) {
      throw new ForbiddenError('Cannot deactivate your own account');
    }

    const user = await userRepository.findById(targetId);
    if (!user) throw new NotFoundError('User');

    const updated = await userRepository.update(targetId, { is_active: false });

    await auditRepository.create({
      user_id: adminId,
      action: 'user.delete',
      resource: 'user',
      resource_id: targetId,
      details: { deactivated_email: user.email },
      ip_address: ip,
    });

    logger.info({ adminId, targetId }, 'Admin deactivated user');
    return updated;
  },
};
