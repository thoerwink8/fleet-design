import * as React from 'react';
interface OpenState {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** The button that opens it. Must accept a ref and props (use `Button`). Leave out when you open it from state. */
    trigger?: React.ReactElement;
}
export interface DialogProps extends OpenState {
    title: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
    /** Buttons at the bottom right, usually 取消 + one primary action. */
    footer?: React.ReactNode;
}
/**
 * A modal dialog for a short task: focus moves inside and is trapped, Esc or the scrim closes it, focus returns to
 * the trigger. `<Dialog trigger={<Button>重命名</Button>} title="重命名会话" footer={…}>…</Dialog>`.
 * Use `DialogClose` around a footer button to close it.
 */
export declare function Dialog({ open, defaultOpen, onOpenChange, trigger, title, description, children, footer }: DialogProps): React.JSX.Element;
/** Closes the surrounding Dialog or Drawer when its child is clicked: `<DialogClose render={<Button>取消</Button>} />`. */
export declare const DialogClose: React.ForwardRefExoticComponent<Omit<import("@base-ui/react").DialogCloseProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export interface ConfirmDialogProps extends OpenState {
    title: React.ReactNode;
    description: React.ReactNode;
    /** What will be affected (the names being deleted); shown in a short scrolling list. */
    children?: React.ReactNode;
    /** Names the action and its object: "删除 4 个会话", never "确定". */
    confirmLabel: React.ReactNode;
    cancelLabel?: React.ReactNode;
    /** Irreversible actions use the danger button. */
    danger?: boolean;
    onConfirm: () => void;
}
/**
 * Confirmation before an irreversible action (prefer undo for anything reversible). Focus starts on 取消, Esc cancels,
 * and the scrim does not dismiss it: `<ConfirmDialog title="删除对话" description="删除后无法恢复。" confirmLabel="删除对话" danger onConfirm={del} />`.
 */
export declare function ConfirmDialog({ open, defaultOpen, onOpenChange, trigger, title, description, children, confirmLabel, cancelLabel, danger, onConfirm, }: ConfirmDialogProps): React.JSX.Element;
export {};
