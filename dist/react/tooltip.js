import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { cx } from './internal.js';
/**
 * A short tip on hover (after 500ms) or keyboard focus, closed by Esc:
 * `<Tooltip content="新建会话" shortcut="Ctrl+N"><Button icon aria-label="新建会话">…</Button></Tooltip>`.
 * Wrap the app in `<TooltipProvider>` so moving between triggers skips the delay.
 */
export function Tooltip({ children, content, shortcut, side = 'top', delay = 500, open, defaultOpen, onOpenChange, disabled, }) {
    return (_jsxs(BaseTooltip.Root, { open: open, defaultOpen: defaultOpen, onOpenChange: (next) => onOpenChange?.(next), disabled: disabled, children: [_jsx(BaseTooltip.Trigger, { delay: delay, render: children }), _jsx(BaseTooltip.Portal, { children: _jsx(BaseTooltip.Positioner, { side: side, sideOffset: 8, collisionPadding: 8, children: _jsxs(BaseTooltip.Popup, { className: cx('fa-tip'), style: { maxWidth: 240 }, children: [_jsx("span", { children: content }), shortcut && _jsx("span", { className: "fa-kbd", children: shortcut })] }) }) })] }));
}
/** Shares the hover delay between tooltips: once one is open, the next opens at once. */
export const TooltipProvider = BaseTooltip.Provider;
