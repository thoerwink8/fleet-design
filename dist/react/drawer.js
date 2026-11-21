import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import * as React from 'react';
/**
 * A panel that slides in from the left edge on narrow screens (the session list on a phone). Modal: focus is trapped,
 * Esc or the scrim closes it, focus returns to the trigger, and closed it leaves no shadow at the edge.
 * `<Drawer label="会话列表" trigger={<IconButton label="打开会话列表">…</IconButton>}>…</Drawer>`
 */
const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
export function Drawer({ open, defaultOpen, onOpenChange, trigger, label, children }) {
    const panel = React.useRef(null);
    // However it opens (pointer, keyboard, state), focus goes to the first control inside, like Dialog.
    const initialFocus = () => panel.current?.querySelector(FOCUSABLE) ?? panel.current;
    return (_jsxs(BaseDialog.Root, { open: open, defaultOpen: defaultOpen, onOpenChange: (next) => onOpenChange?.(next), children: [trigger && _jsx(BaseDialog.Trigger, { render: trigger }), _jsxs(BaseDialog.Portal, { children: [_jsx(BaseDialog.Backdrop, { className: "fa-backdrop" }), _jsx(BaseDialog.Popup, { ref: panel, className: "fa-drawer fa-drawer--fixed", "aria-label": label, initialFocus: initialFocus, children: children })] })] }));
}
