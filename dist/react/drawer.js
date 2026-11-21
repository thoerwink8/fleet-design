import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
/**
 * A panel that slides in from the left edge on narrow screens (the session list on a phone). Modal: focus is trapped,
 * Esc or the scrim closes it, focus returns to the trigger, and closed it leaves no shadow at the edge.
 * `<Drawer label="会话列表" trigger={<IconButton label="打开会话列表">…</IconButton>}>…</Drawer>`
 */
export function Drawer({ open, defaultOpen, onOpenChange, trigger, label, children }) {
    return (_jsxs(BaseDialog.Root, { open: open, defaultOpen: defaultOpen, onOpenChange: (next) => onOpenChange?.(next), children: [trigger && _jsx(BaseDialog.Trigger, { render: trigger }), _jsxs(BaseDialog.Portal, { children: [_jsx(BaseDialog.Backdrop, { className: "fa-backdrop" }), _jsx(BaseDialog.Popup, { className: "fa-drawer fa-drawer--fixed", "aria-label": label, children: children })] })] }));
}
