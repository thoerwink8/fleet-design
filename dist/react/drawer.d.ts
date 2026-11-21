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
export declare function Drawer({ open, defaultOpen, onOpenChange, trigger, label, children }: DrawerProps): React.JSX.Element;
