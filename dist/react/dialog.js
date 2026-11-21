import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import * as React from 'react';
import { Button } from './button.js';
const TABBABLE = 'a[href],area[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),summary,iframe,audio[controls],video[controls],[contenteditable]:not([contenteditable="false"]),[tabindex]:not([tabindex="-1"])';
function isTabbableElement(el, root) {
    if (el.matches(':disabled') || el.closest('[inert],[hidden]') || el.tabIndex < 0)
        return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden')
        return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0)
        return false;
    if (el.tagName === 'SUMMARY') {
        const details = el.closest('details');
        if (!details || details.querySelector(':scope > summary') !== el)
            return false;
    }
    if (el instanceof HTMLInputElement && el.type === 'radio' && el.name) {
        const scope = el.form ?? root;
        const radios = [...scope.querySelectorAll('input[type="radio"]')].filter((r) => r.name === el.name && !r.disabled);
        const checked = radios.find((r) => r.checked);
        return (checked ?? radios[0]) === el;
    }
    return true;
}
function tabbables(root) {
    const candidates = [...root.querySelectorAll(TABBABLE)].filter((el) => isTabbableElement(el, root));
    const positive = candidates.filter((el) => el.tabIndex > 0).sort((a, b) => a.tabIndex - b.tabIndex);
    const regular = candidates.filter((el) => el.tabIndex === 0);
    return [...positive, ...regular];
}
function trapTab(event) {
    if (event.defaultPrevented || event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey)
        return;
    const popup = event.currentTarget;
    const list = tabbables(popup);
    if (list.length === 0) {
        event.preventDefault();
        popup.focus();
        return;
    }
    const first = list[0];
    const last = list[list.length - 1];
    if (!first || !last)
        return;
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (event.shiftKey) {
        if (!active || active === first || active === popup || !popup.contains(active)) {
            event.preventDefault();
            last.focus();
        }
    }
    else if (!active || active === last || !popup.contains(active)) {
        event.preventDefault();
        first.focus();
    }
}
/**
 * A modal dialog for a short task: focus moves inside and is trapped, Esc or the scrim closes it, focus returns to
 * the trigger. `<Dialog trigger={<Button>重命名</Button>} title="重命名会话" footer={…}>…</Dialog>`.
 * Use `DialogClose` around a footer button to close it.
 */
export function Dialog({ open, defaultOpen, onOpenChange, trigger, title, description, children, footer }) {
    return (_jsxs(BaseDialog.Root, { open: open, defaultOpen: defaultOpen, onOpenChange: (next) => onOpenChange?.(next), children: [trigger && _jsx(BaseDialog.Trigger, { render: trigger }), _jsxs(BaseDialog.Portal, { children: [_jsx(BaseDialog.Backdrop, { className: "fa-backdrop" }), _jsxs(BaseDialog.Popup, { className: "fa-dialog fa-dialog--modal", onKeyDown: trapTab, children: [_jsx(BaseDialog.Title, { children: title }), description !== undefined && _jsx(BaseDialog.Description, { children: description }), children, footer !== undefined && _jsx("div", { className: "fa-dialog__foot", children: footer })] })] })] }));
}
/** Closes the surrounding Dialog or Drawer when its child is clicked: `<DialogClose render={<Button>取消</Button>} />`. */
export const DialogClose = BaseDialog.Close;
/**
 * Confirmation before an irreversible action (prefer undo for anything reversible). Focus starts on 取消, Esc cancels,
 * and the scrim does not dismiss it: `<ConfirmDialog title="删除对话" description="删除后无法恢复。" confirmLabel="删除对话" danger onConfirm={del} />`.
 */
export function ConfirmDialog({ open, defaultOpen, onOpenChange, trigger, title, description, children, confirmLabel, cancelLabel = '取消', danger = false, onConfirm, }) {
    const cancel = React.useRef(null);
    return (_jsxs(AlertDialog.Root, { open: open, defaultOpen: defaultOpen, onOpenChange: (next) => onOpenChange?.(next), children: [trigger && _jsx(AlertDialog.Trigger, { render: trigger }), _jsxs(AlertDialog.Portal, { children: [_jsx(AlertDialog.Backdrop, { className: "fa-backdrop" }), _jsxs(AlertDialog.Popup, { className: "fa-dialog fa-dialog--modal", initialFocus: cancel, onKeyDown: trapTab, children: [_jsx(AlertDialog.Title, { children: title }), _jsx(AlertDialog.Description, { children: description }), children !== undefined && _jsx("div", { className: "fa-names", children: children }), _jsxs("div", { className: "fa-dialog__foot", children: [_jsx(AlertDialog.Close, { render: _jsx(Button, { variant: "secondary", ref: cancel }), children: cancelLabel }), _jsx(AlertDialog.Close, { render: _jsx(Button, { variant: danger ? 'danger' : 'primary' }), onClick: onConfirm, children: confirmLabel })] })] })] })] }));
}
