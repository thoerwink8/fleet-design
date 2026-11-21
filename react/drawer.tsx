import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import * as React from 'react';

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The button that opens it (usually an icon button with `aria-label`). */
  trigger?: React.ReactElement;
  /** Accessible name of the panel. */
  label: string;
  children?: React.ReactNode;
}

/**
 * A panel that slides in from the left edge on narrow screens (the session list on a phone). Modal: focus is trapped,
 * Esc or the scrim closes it, focus returns to the trigger, and closed it leaves no shadow at the edge.
 * `<Drawer label="会话列表" trigger={<IconButton label="打开会话列表">…</IconButton>}>…</Drawer>`
 */
const FOCUSABLE =
  'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Drawer({ open, defaultOpen, onOpenChange, trigger, label, children }: DrawerProps) {
  const panel = React.useRef<HTMLDivElement>(null);
  // However it opens (pointer, keyboard, state), focus goes to the first control inside, like Dialog.
  const initialFocus = () => panel.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panel.current;
  return (
    <BaseDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={(next) => onOpenChange?.(next)}>
      {trigger && <BaseDialog.Trigger render={trigger} />}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fa-backdrop" />
        <BaseDialog.Popup ref={panel} className="fa-drawer fa-drawer--fixed" aria-label={label} initialFocus={initialFocus}>
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
