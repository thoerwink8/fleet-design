import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Toast as BaseToast } from '@base-ui/react/toast';
import { Icon } from './internal.js';
const MARK = { success: 'check', info: 'info', danger: 'alert', warning: 'warn' };
function ToastList({ closeLabel }) {
    const { toasts } = BaseToast.useToastManager();
    return toasts.map((t) => (_jsxs(BaseToast.Root, { toast: t, className: "fa-toast", children: [_jsx("span", { className: `m-${t.data?.kind ?? 'info'}`, children: t.data?.icon ?? _jsx(Icon, { name: MARK[t.data?.kind ?? 'info'] }) }), _jsx(BaseToast.Title, { className: "grow", render: _jsx("span", {}) }), _jsx(BaseToast.Action, { className: "fa-btn fa-btn--sm" }), _jsx(BaseToast.Close, { className: "fa-icon-btn", "aria-label": closeLabel, children: _jsx(Icon, { name: "x" }) })] }, t.id)));
}
/**
 * Put once near the app root: it holds the queue and renders the stack at the bottom right, outside the composer.
 * Timers pause while the pointer is over a toast or focus is inside one.
 */
export function ToastProvider({ children, limit = 3, closeLabel = '关闭', label = '通知' }) {
    return (_jsxs(BaseToast.Provider, { limit: limit, children: [children, _jsx(BaseToast.Portal, { children: _jsx(BaseToast.Viewport, { className: "fa-toasts", "aria-label": label, children: _jsx(ToastList, { closeLabel: closeLabel }) }) })] }));
}
/**
 * Shows short confirmations of what just happened, with undo where possible:
 * `const toast = useToast(); toast.show({ text: '已归档', action: { label: '撤销', onClick: restore } })`.
 * Errors do not go here: they belong in the status strip above the composer.
 */
export function useToast() {
    const manager = BaseToast.useToastManager();
    return {
        show({ text, kind = 'info', icon, action, timeout }) {
            return manager.add({
                title: text,
                type: kind,
                timeout: timeout ?? (action ? 8000 : 4000),
                data: { kind, icon },
                actionProps: action ? { children: action.label, onClick: action.onClick } : undefined,
            });
        },
        close(id) {
            manager.close(id);
        },
    };
}
