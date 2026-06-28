import type { Request, Response, NextFunction } from 'express';
import { supabase } from '@/config/supabase';
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, role, is_active')
    .eq('id', authData.user.id)
    .single();

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
