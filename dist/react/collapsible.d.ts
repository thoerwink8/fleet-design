import type * as React from 'react';
import { type LayoutProps } from './internal.js';
export interface CollapsibleProps extends LayoutProps {
    /** What the head says. For `fold`, a summary of what is inside ("跑了 12 条命令，读了 5 个文件"). */
    title: React.ReactNode;
    /** `section`: a 32px section head in a details panel (put sections inside `DetailsPanel`). `fold`: a quiet 28px summary line that folds a list of steps or tool calls in a conversation. */
    variant?: 'section' | 'fold';
    /** Muted value at the right end of a section head (a count, a size). */
    aside?: React.ReactNode;
    children?: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
}
/**
 * Shows and hides one block: `<Collapsible title="环境" defaultOpen>…</Collapsible>`. The head is a button with
 * `aria-expanded`; Enter and Space toggle it.
 */
export declare function Collapsible({ title, variant, aside, children, open, defaultOpen, onOpenChange, disabled, className, style, }: CollapsibleProps): React.JSX.Element;
export interface DetailsPanelProps extends LayoutProps {
    children?: React.ReactNode;
    /** As the right column of a page: no card frame, sections split by hairlines only. */
    side?: boolean;
    'aria-label'?: string;
}
/** The card that holds `Collapsible` sections (variant `section`). */
export declare function DetailsPanel({ children, side, className, style, ...aria }: DetailsPanelProps): React.JSX.Element;
