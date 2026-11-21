import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Select as BaseSelect } from '@base-ui/react/select';
import * as React from 'react';
import { cx, Icon } from './internal.js';
/**
 * A single-choice dropdown: `<Select options={[{ value: '15', label: '较大' }]} value={v} onValueChange={setV} aria-label="字号" />`.
 * The list opens under the trigger; arrow keys move, Enter picks, Esc closes and focus returns to the trigger.
 */
export function Select({ options, value, defaultValue, onValueChange, placeholder, variant = 'default', lead, disabled, name, open, defaultOpen, onOpenChange, className, style, ...aria }) {
    const [innerOpen, setInnerOpen] = React.useState(defaultOpen ?? false);
    const isOpen = open ?? innerOpen;
    const openRef = React.useRef(isOpen);
    openRef.current = isOpen;
    const [portalOpen, setPortalOpen] = React.useState(isOpen);
    if (isOpen && !portalOpen)
        setPortalOpen(true);
    return (_jsxs(BaseSelect.Root, { items: options.map((o) => ({ value: o.value, label: o.label })), value: value, defaultValue: defaultValue, onValueChange: (next) => {
            if (next !== null)
                onValueChange?.(next);
        }, disabled: disabled, name: name, open: isOpen, onOpenChange: (next) => {
            if (open === undefined)
                setInnerOpen(next);
            if (next)
                setPortalOpen(true);
            onOpenChange?.(next);
        }, onOpenChangeComplete: (next) => {
            if (!next && !openRef.current)
                setPortalOpen(false);
        }, children: [_jsxs(BaseSelect.Trigger, { ...aria, className: cx('fa-select', variant === 'ghost' && 'fa-select--ghost', className), style: style, children: [lead, _jsx(BaseSelect.Value, { className: "lbl", placeholder: placeholder }), _jsx(BaseSelect.Icon, { render: _jsx("span", {}), children: _jsx(Icon, { name: "chevD" }) })] }), portalOpen && (_jsx(BaseSelect.Portal, { children: _jsx(BaseSelect.Positioner, { alignItemWithTrigger: false, side: "bottom", align: "start", sideOffset: 4, collisionPadding: 8, children: _jsx(BaseSelect.Popup, { className: "fa-pop", style: { minWidth: 'var(--anchor-width)' }, children: _jsx(BaseSelect.List, { children: options.map((o) => (_jsxs(BaseSelect.Item, { value: o.value, disabled: o.disabled, className: "fa-item", children: [_jsx(BaseSelect.ItemText, { className: "grow", children: o.label }), _jsx(BaseSelect.ItemIndicator, { render: _jsx("span", { className: "tick" }), children: _jsx(Icon, { name: "check" }) })] }, o.value))) }) }) }) }))] }));
}
