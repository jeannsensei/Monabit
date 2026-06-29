import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Star, Users, UserCog, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/stores/app.store';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard, roles: ['admin', 'user'] },
  { to: '/favorites', labelKey: 'nav.favorites', icon: Star, roles: ['admin', 'user'] },
  { to: '/admin/users', labelKey: 'nav.userManagement', icon: Users, roles: ['admin'] },
  { to: '/profile', labelKey: 'nav.profile', icon: UserCog, roles: ['admin', 'user'] },
];

export function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16',
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {sidebarOpen && (
          <span className="text-lg font-bold text-primary">MonaBit</span>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn('ml-auto rounded-md p-1 hover:bg-accent', !sidebarOpen && 'mx-auto')}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                !sidebarOpen && 'justify-center px-2',
              )
            }
          >
            <item.icon size={20} />
            {sidebarOpen && <span>{t(item.labelKey)}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
