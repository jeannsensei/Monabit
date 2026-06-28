import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { apiRequest } from '@/services/api';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [saving, setSaving] = useState(false);

  if (isLoading || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    setSaving(true);
    try {
      await apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          username: (form.elements.namedItem('username') as HTMLInputElement).value,
          full_name: (form.elements.namedItem('full_name') as HTMLInputElement).value,
        }),
      });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={user.email ?? ''}
            disabled
            className="mt-1 block w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input
            name="username"
            type="text"
            defaultValue={user.username ?? ''}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            name="full_name"
            type="text"
            defaultValue={user.full_name ?? ''}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
