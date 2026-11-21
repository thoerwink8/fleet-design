import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type * as React from 'react';
import { cx } from './internal.js';

export interface TooltipProps {
  /** The element that shows the tip on hover and keyboard focus. Must accept a ref and props (a button, a link). */
  children: React.ReactElement;
  /** Tip text. Supplementary only: never the only place important information lives. */
  content: React.ReactNode;
  /** Keyboard shortcut shown after the text, e.g. "Ctrl+N". */
  shortcut?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Hover delay in ms (default 500). */
  delay?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

/**
 * A short tip on hover (after 500ms) or keyboard focus, closed by Esc:
 * `<Tooltip content="新建会话" shortcut="Ctrl+N"><Button icon aria-label="新建会话">…</Button></Tooltip>`.
 * Wrap the app in `<TooltipProvider>` so moving between triggers skips the delay.
 */
export function Tooltip({
  children,
  content,
  shortcut,
  side = 'top',
  delay = 500,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
}: TooltipProps) {
  return (
    <BaseTooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={(next) => onOpenChange?.(next)} disabled={disabled}>
      <BaseTooltip.Trigger delay={delay} render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={8} collisionPadding={8}>
          <BaseTooltip.Popup className={cx('fa-tip')} style={{ maxWidth: 240 }}>
            <span>{content}</span>
            {shortcut && <span className="fa-kbd">{shortcut}</span>}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

/** Shares the hover delay between tooltips: once one is open, the next opens at once. */
export const TooltipProvider = BaseTooltip.Provider;
