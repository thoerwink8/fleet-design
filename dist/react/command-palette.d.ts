import * as React from 'react';
export interface CommandItem {
    id: string;
    /** First line, 14px. Searched. */
    title: string;
    /** Group heading the item is listed under. Items keep their order inside a group. */
    group?: string;
    /** Second line, 12px muted (a summary). Alone it makes a 52px two-line row (`.fa-cmd__row--2`); with `meta`/`metaEnd` the row is three lines (72). */
    summary?: React.ReactNode;
    /** Third line, left side (model, turns) and right side (workspace, branch). One line each; a long value is cut with an ellipsis and the full text goes to its tooltip when it is a string. */
    meta?: React.ReactNode;
    metaEnd?: React.ReactNode;
    /** Right end of the first line: a time, a shortcut. */
    end?: React.ReactNode;
    /** Icon or agent slot before the text. */
    lead?: React.ReactNode;
    /** Extra words that match this item but are not shown. */
    keywords?: string;
    disabled?: boolean;
    onRun: () => void;
}
export interface CommandPaletteProps {
    items: readonly CommandItem[];
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** The button that opens it; usually it is opened from a shortcut by setting `open`. */
    trigger?: React.ReactElement;
    placeholder?: string;
    /** Accessible name of the palette and its input. */
    label?: string;
    emptyText?: React.ReactNode;
    /** Key hints in the footer; leave out for the default ↑↓ / Enter / Esc row. */
    footer?: React.ReactNode;
    /** Custom matching; the default matches every space-separated word against the title and keywords, ignoring case. */
    filter?: (item: CommandItem, query: string) => boolean;
}
/**
 * Search and run commands or jump to sessions: typing filters, ↑↓ move, Enter runs, Esc closes and focus returns.
 * `<CommandPalette open={open} onOpenChange={setOpen} items={[{ id: 'new', title: '新建会话', group: '命令', onRun }]} />`
 */
export declare function CommandPalette({ items, open, defaultOpen, onOpenChange, trigger, placeholder, label, emptyText, footer, filter, }: CommandPaletteProps): React.JSX.Element;
