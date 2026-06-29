import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export function Tooltip({ children, content, delayDuration = 300 }: { children: React.ReactNode; content: string; delayDuration?: number }) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={4}
            className={cn(
              'z-[9999] overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-xs',
              'text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-popover" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
