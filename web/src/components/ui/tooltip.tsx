import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'bottom';
}

export function Tooltip({ children, content, side = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const show = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({
        top: side === 'top' ? rect.top - 6 : rect.bottom + 6,
        left: rect.left + rect.width / 2,
      });
    }
    setVisible(true);
  };

  const hide = () => setVisible(false);

  useEffect(() => {
    if (!visible) return;
    const handler = () => setVisible(false);
    document.addEventListener('scroll', handler, true);
    return () => document.removeEventListener('scroll', handler, true);
  }, [visible]);

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex"
      >
        {children}
      </div>
      {visible &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: 'fixed',
              left: pos.left,
              top: pos.top,
              transform: 'translate(-50%, 0)',
            }}
            className={cn(
              'z-[9999] whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs',
              'text-popover-foreground shadow-md pointer-events-none',
              side === 'top' && '-translate-y-full',
            )}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
