import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import * as React from 'react';
import { Button } from './button.js';
/**
 * A modal dialog for a short task: focus moves inside and is trapped, Esc or the scrim closes it, focus returns to
 * the trigger. `<Dialog trigger={<Button>重命名</Button>} title="重命名会话" footer={…}>…</Dialog>`.
 * Use `DialogClose` around a footer button to close it.
 */
export function Dialog({ open, defaultOpen, onOpenChange, trigger, title, description, children, footer }) {
    return (_jsxs(BaseDialog.Root, { open: open, defaultOpen: defaultOpen, onOpenChange: (next) => onOpenChange?.(next), children: [trigger && _jsx(BaseDialog.Trigger, { render: trigger }), _jsxs(BaseDialog.Portal, { children: [_jsx(BaseDialog.Backdrop, { className: "fa-backdrop" }), _jsxs(BaseDialog.Popup, { className: "fa-dialog fa-dialog--modal", children: [_jsx(BaseDialog.Title, { children: title }), description !== undefined && _jsx(BaseDialog.Description, { children: description }), children, footer !== undefined && _jsx("div", { className: "fa-dialog__foot", children: footer })] })] })] }));
}
/** Closes the surrounding Dialog or Drawer when its child is clicked: `<DialogClose render={<Button>取消</Button>} />`. */
export const DialogClose = BaseDialog.Close;
/**
 * Confirmation before an irreversible action (prefer undo for anything reversible). Focus starts on 取消, Esc cancels,
 * and the scrim does not dismiss it: `<ConfirmDialog title="删除对话" description="删除后无法恢复。" confirmLabel="删除对话" danger onConfirm={del} />`.
 */
export function ConfirmDialog({ open, defaultOpen, onOpenChange, trigger, title, description, children, confirmLabel, cancelLabel = '取消', danger = false, onConfirm, }) {
    const cancel = React.useRef(null);
    return (_jsxs(AlertDialog.Root, { open: open, defaultOpen: defaultOpen, onOpenChange: (next) => onOpenChange?.(next), children: [trigger && _jsx(AlertDialog.Trigger, { render: trigger }), _jsxs(AlertDialog.Portal, { children: [_jsx(AlertDialog.Backdrop, { className: "fa-backdrop" }), _jsxs(AlertDialog.Popup, { className: "fa-dialog fa-dialog--modal", initialFocus: cancel, children: [_jsx(AlertDialog.Title, { children: title }), _jsx(AlertDialog.Description, { children: description }), children !== undefined && _jsx("div", { className: "fa-names", children: children }), _jsxs("div", { className: "fa-dialog__foot", children: [_jsx(AlertDialog.Close, { render: _jsx(Button, { variant: "secondary", ref: cancel }), children: cancelLabel }), _jsx(AlertDialog.Close, { render: _jsx(Button, { variant: danger ? 'danger' : 'primary' }), onClick: onConfirm, children: confirmLabel })] })] })] })] }));
}
