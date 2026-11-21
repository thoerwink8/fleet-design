import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { cx, Icon } from './internal.js';
/**
 * Shows and hides one block: `<Collapsible title="环境" defaultOpen>…</Collapsible>`. The head is a button with
 * `aria-expanded`; Enter and Space toggle it.
 */
export function Collapsible({ title, variant = 'section', aside, children, open, defaultOpen, onOpenChange, disabled, className, style, }) {
    const fold = variant === 'fold';
    return (_jsxs(BaseCollapsible.Root, { open: open, defaultOpen: defaultOpen, onOpenChange: (next) => onOpenChange?.(next), disabled: disabled, className: cx(fold ? 'fa-fold' : 'fa-dp__sec', className), style: style, children: [_jsxs(BaseCollapsible.Trigger, { className: fold ? 'fa-fold__sum' : 'fa-dp__head', children: [fold ? _jsx(Icon, { name: "chevR" }) : _jsx(Icon, { name: "chevR", className: "chev" }), title, !fold && aside !== undefined && _jsx("span", { className: "aside", children: aside })] }), _jsx(BaseCollapsible.Panel, { className: fold ? 'fa-fold__list' : 'fa-dp__body', children: children })] }));
}
/** The card that holds `Collapsible` sections (variant `section`). */
export function DetailsPanel({ children, side = false, className, style, ...aria }) {
    return (_jsx("div", { ...aria, className: cx('fa-dp', side && 'fa-dp--side', className), style: style, children: children }));
}
