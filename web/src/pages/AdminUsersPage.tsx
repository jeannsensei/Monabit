import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { Modal } from '@/components/ui/modal';
import { Select, SelectItem } from '@/components/ui/select';
import { Plus, Pencil, Ban, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import type { UserProfile } from '@/types';

const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  username: z.string().optional(),
  full_name: z.string().optional(),
  role: z.enum(['admin', 'user']),
});

const editUserSchema = z.object({
  username: z.string().optional(),
  full_name: z.string().optional(),
  role: z.enum(['admin', 'user']),
});

type CreateInput = z.infer<typeof createUserSchema>;
type EditInput = z.infer<typeof editUserSchema>;

export function AdminUsersPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useUsers(page);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.subtitle')}</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={16} />
          {t('admin.addUser')}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {t('admin.failedToLoad')} <button onClick={() => refetch()} className="underline">{t('dashboard.retry')}</button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : data ? (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">{t('admin.user')}</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">{t('admin.email')}</th>
                  <th className="px-4 py-3 text-center font-medium">{t('admin.role')}</th>
                  <th className="px-4 py-3 text-center font-medium">{t('admin.status')}</th>
                  <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">{t('admin.created')}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((user) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3"><span className="font-medium">{user.full_name || user.username || '—'}</span></td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{user.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
                        {user.is_active ? t('admin.active') : t('admin.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground hidden sm:table-cell">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip content={t('admin.tooltipEdit')}>
                          <button onClick={() => { setEditingUser(user); setShowForm(true); }} className="rounded-md p-1.5 hover:bg-accent"><Pencil size={14} /></button>
                        </Tooltip>
                        <Tooltip content={user.is_active ? t('admin.tooltipDeactivate') : t('admin.tooltipActivate')}>
                          <button onClick={() => setDeletingUser(user)} className="rounded-md p-1.5 hover:bg-accent">
                            {user.is_active ? <Ban size={14} /> : <CheckCircle size={14} />}
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.pagination.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t('admin.pageInfo', { page, totalPages: data.pagination.total_pages, total: data.pagination.total })}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-md border px-3 py-1 text-sm disabled:opacity-50">{t('admin.previous')}</button>
                <button disabled={page >= data.pagination.total_pages} onClick={() => setPage(page + 1)} className="rounded-md border px-3 py-1 text-sm disabled:opacity-50">{t('admin.next')}</button>
              </div>
            </div>
          )}
        </>
      ) : null}

      {showForm && (
        <Modal open onClose={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            {editingUser ? (
              <EditUserForm user={editingUser} loading={updateUser.isPending} onSubmit={(data) => { updateUser.mutate({ id: editingUser.id, ...data }); setShowForm(false); }} onCancel={() => setShowForm(false)} />
            ) : (
              <CreateUserForm loading={createUser.isPending} onSubmit={(data) => { createUser.mutate(data); setShowForm(false); }} onCancel={() => setShowForm(false)} />
            )}
          </div>
        </Modal>
      )}

      {deletingUser && (
        <Modal open onClose={() => setDeletingUser(null)}>
          <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
              <div>
                <h2 className="text-lg font-semibold">{deletingUser.is_active ? t('admin.deactivateUser') : t('admin.activateUser')}</h2>
                <p className="text-sm text-muted-foreground">
                  {deletingUser.is_active
                    ? t('admin.deactivateConfirm', { name: deletingUser.full_name || deletingUser.username || 'this user' })
                    : t('admin.activateConfirm', { name: deletingUser.full_name || deletingUser.username || 'this user' })}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeletingUser(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">{t('admin.cancel')}</button>
              <button onClick={() => { deleteUser.mutate(deletingUser.id); setDeletingUser(null); }} className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
                {deletingUser.is_active ? t('admin.deactivate') : t('admin.activate')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CreateUserForm({ loading, onSubmit, onCancel }: { loading: boolean; onSubmit: (data: CreateInput) => void; onCancel: () => void }) {
  const { t } = useTranslation();
  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateInput>({ resolver: zodResolver(createUserSchema), defaultValues: { role: 'user' } });

  return (
    <div>
      <h2 className="text-lg font-semibold">{t('admin.createUser')}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium">{t('admin.email')}</label>
          <input type="email" disabled={loading} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">{t('auth.password')}</label>
          <input type="password" disabled={loading} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" {...register('password')} />
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">{t('auth.username')}</label>
          <input type="text" disabled={loading} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" {...register('username')} />
        </div>
        <div>
          <label className="block text-sm font-medium">{t('auth.fullName')}</label>
          <input type="text" disabled={loading} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" {...register('full_name')} />
        </div>
        <div>
          <label className="block text-sm font-medium">{t('admin.role')}</label>
          <Controller name="role" control={control} render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={loading}>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </Select>
          )} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="rounded-md border px-4 py-2 text-sm">{t('admin.cancel')}</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? t('admin.creating') : t('admin.create')}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditUserForm({ user, loading, onSubmit, onCancel }: { user: UserProfile; loading: boolean; onSubmit: (data: EditInput) => void; onCancel: () => void }) {
  const { t } = useTranslation();
  const { register, handleSubmit, control, formState: { errors } } = useForm<EditInput>({
    resolver: zodResolver(editUserSchema),
    values: { username: user.username ?? '', full_name: user.full_name ?? '', role: user.role },
  });

  return (
    <div>
      <h2 className="text-lg font-semibold">{t('admin.editUser')}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium">{t('auth.username')}</label>
          <input type="text" disabled={loading} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" {...register('username')} />
          {errors.username && <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">{t('auth.fullName')}</label>
          <input type="text" disabled={loading} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" {...register('full_name')} />
          {errors.full_name && <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">{t('admin.role')}</label>
          <Controller name="role" control={control} render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={loading}>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </Select>
          )} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="rounded-md border px-4 py-2 text-sm">{t('admin.cancel')}</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? t('admin.saving') : t('admin.update')}
          </button>
        </div>
      </form>
    </div>
  );
}
