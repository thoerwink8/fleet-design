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
export declare function Drawer({ open, defaultOpen, onOpenChange, trigger, label, children }: DrawerProps): React.JSX.Element;
