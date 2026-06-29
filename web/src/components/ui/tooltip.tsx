import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'bottom';
}

export function Tooltip({ children, content, side = 'top' }: TooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div
        className={cn(
          'pointer-events-none absolute left-1/2 -translate-x-1/2 z-50',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          'whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs',
          'text-popover-foreground shadow-md border',
          side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
        )}
      >
        {content}
      </div>
    </div>
  );
}
