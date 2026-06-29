import { Moon, Sun, LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/stores/app.store';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useAppStore();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div>
        <span className="text-sm text-muted-foreground">
          {t('nav.welcomeBack', { name: user?.username || user?.full_name || 'User' })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut size={16} />
          {t('nav.logout')}
        </button>
      </div>
    </header>
  );
}
