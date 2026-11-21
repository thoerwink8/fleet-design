import * as React from 'react';
interface ItemBase {
    /** Stable key; defaults to the position. */
    id?: string;
    label: React.ReactNode;
    disabled?: boolean;
    /** Single letter, shown at the right edge. It works while the menu is open, without modifiers. */
    shortcut?: string;
}
export interface MenuActionItem extends ItemBase {
    type?: 'item';
    onSelect?: () => void;
    /** Muted trailing text (a count, a size). */
    end?: React.ReactNode;
    /** Delete-type actions: danger text, in their own last group. */
    danger?: boolean;
}
export interface MenuCheckboxItem extends ItemBase {
    type: 'checkbox';
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}
export interface MenuSeparator {
    type: 'separator';
    id?: string;
}
export interface MenuGroup {
    type: 'group';
    id?: string;
    label: React.ReactNode;
    items: readonly MenuEntry[];
}
export interface MenuSubmenu {
    type: 'submenu';
    id?: string;
    label: React.ReactNode;
    disabled?: boolean;
    items: readonly MenuEntry[];
}
export type MenuEntry = MenuActionItem | MenuCheckboxItem | MenuSeparator | MenuGroup | MenuSubmenu;
export interface MenuProps {
    /** The button that opens the menu. Must accept a ref and props (use `Button` or `IconButton`). */
    trigger: React.ReactElement;
    items: readonly MenuEntry[];
    /** `plain` (default): text-only items with 12px side padding, for context menus. `icons`: 8px padding for items that lead with an icon. */
    variant?: 'plain' | 'icons';
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
    /** Popup width in px (layout only; default 248). */
    width?: number;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    'aria-label'?: string;
}
/**
 * An action menu from data: `<Menu trigger={<IconButton label="更多">…</IconButton>} items={[{ label: '置顶', shortcut: 'P', onSelect }]} />`.
 * Arrow keys move, Enter runs, Esc closes and returns focus to the trigger; checkbox items stay open when toggled.
 * For full control compose the Base UI parts with the same classes (`fa-pop`, `fa-item`, `fa-sep`, `fa-glabel`).
 */
export declare function Menu({ trigger, items, variant, side, align, width, open, defaultOpen, onOpenChange, 'aria-label': label, }: MenuProps): React.JSX.Element;
export {};
