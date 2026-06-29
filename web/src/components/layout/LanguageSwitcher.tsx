import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggle = () => {
    const next = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('monabit-language', next);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <Languages size={14} />
      <span className={cn(i18n.language === 'en' && 'font-semibold text-foreground')}>EN</span>
      <span className="text-muted-foreground/40">|</span>
      <span className={cn(i18n.language === 'es' && 'font-semibold text-foreground')}>ES</span>
    </button>
  );
}
