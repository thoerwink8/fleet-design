import type * as React from 'react';
export type ToastKind = 'success' | 'info' | 'danger' | 'warning';
export interface ToastOptions {
    /** One short sentence: what just happened ("已归档「排查登录超时」"). */
    text: React.ReactNode;
    /** Colour of the leading mark only; the text stays `--fg`. */
    kind?: ToastKind;
    /** Replaces the default mark icon. */
    icon?: React.ReactNode;
    /** One action, usually 撤销 (undo). A toast with an action stays 8 s instead of 4 s. */
    action?: {
        label: React.ReactNode;
        onClick: () => void;
    };
    /** Milliseconds before it leaves; 0 keeps it until closed. Default 4000, or 8000 with an action. */
    timeout?: number;
}
export interface ToastProviderProps {
    children?: React.ReactNode;
    /** At most this many toasts are shown; the oldest leaves first (default 3). */
    limit?: number;
    /** Accessible name of the close button on each toast. */
    closeLabel?: string;
    /** Accessible name of the notification region. */
    label?: string;
}
/**
 * Put once near the app root: it holds the queue and renders the stack at the bottom right, outside the composer.
 * Timers pause while the pointer is over a toast or focus is inside one.
 */
export declare function ToastProvider({ children, limit, closeLabel, label }: ToastProviderProps): React.JSX.Element;
/**
 * Shows short confirmations of what just happened, with undo where possible:
 * `const toast = useToast(); toast.show({ text: '已归档', action: { label: '撤销', onClick: restore } })`.
 * Errors do not go here: they belong in the status strip above the composer.
 */
export declare function useToast(): {
    show({ text, kind, icon, action, timeout }: ToastOptions): string;
    close(id: string): void;
};
