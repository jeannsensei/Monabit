import { timeAgo } from '@/lib/utils';
import { Clock } from 'lucide-react';

export function LastUpdated({ timestamp }: { timestamp?: string }) {
  if (!timestamp) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Clock size={12} />
      Updated {timeAgo(timestamp)}
    </span>
  );
}
