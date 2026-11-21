import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type * as React from 'react';

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
export function Drawer({ open, defaultOpen, onOpenChange, trigger, label, children }: DrawerProps) {
  return (
    <BaseDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={(next) => onOpenChange?.(next)}>
      {trigger && <BaseDialog.Trigger render={trigger} />}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fa-backdrop" />
        <BaseDialog.Popup className="fa-drawer fa-drawer--fixed" aria-label={label}>
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
