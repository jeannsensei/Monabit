import { timeAgo } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';

export function LastUpdated({ timestamp }: { timestamp?: string }) {
  const { t } = useTranslation();
  if (!timestamp) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Clock size={12} />
      {t('dashboard.lastUpdated', { time: timeAgo(timestamp) })}
    </span>
  );
}
