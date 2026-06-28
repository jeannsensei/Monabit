import { supabase } from '@/config/supabase';

export const auditRepository = {
  async create(data: {
    user_id: string;
    action: string;
    resource: string;
    resource_id?: string;
    details?: Record<string, unknown>;
    ip_address?: string;
  }) {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: data.user_id,
        action: data.action,
        resource: data.resource,
        resource_id: data.resource_id ?? null,
        details: data.details ?? null,
        ip_address: data.ip_address ?? null,
      });

    if (error) {
      console.error('Failed to write audit log:', error);
    }
  },
};
