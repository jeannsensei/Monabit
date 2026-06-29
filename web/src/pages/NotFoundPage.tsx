import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-muted-foreground/30">404</h1>
      <p className="text-lg text-muted-foreground">{t('common.notFound')}</p>
      <Link to="/" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        {t('common.backToDashboard')}
      </Link>
    </div>
  );
}
