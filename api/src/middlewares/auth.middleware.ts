import type { Request, Response, NextFunction } from 'express';
import { supabase } from '@/config/supabase';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { userRepository } from '@/repositories';
import { logger } from '@/utils/logger';
import { UnauthorizedError, ForbiddenError } from '@/utils/errors';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
        role: 'admin' | 'user';
        is_active: boolean;
      };
    }
  }
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = header.slice(7);

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  let profile = await userRepository.findById(authData.user.id);

  if (!profile) {
    logger.info({ userId: authData.user.id }, 'Profile not found — creating on the fly');
    await db.insert(profiles).values({
      id: authData.user.id,
      username: authData.user.email ?? null,
      fullName: authData.user.user_metadata?.full_name as string ?? null,
      avatarUrl: authData.user.user_metadata?.avatar_url as string ?? null,
      role: 'user',
    });
    profile = await userRepository.findById(authData.user.id);
  }

  if (!profile || !profile.is_active) {
    throw new ForbiddenError('Account is deactivated or does not exist');
  }

  req.user = {
    id: profile.id,
    email: authData.user.email ?? '',
    username: profile.username,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    role: profile.role,
    is_active: profile.is_active,
  };

  next();
}
