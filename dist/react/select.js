import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Select as BaseSelect } from '@base-ui/react/select';
import { cx, Icon } from './internal.js';
/**
 * A single-choice dropdown: `<Select options={[{ value: '15', label: '较大' }]} value={v} onValueChange={setV} aria-label="字号" />`.
 * The list opens under the trigger; arrow keys move, Enter picks, Esc closes and focus returns to the trigger.
 */
export function Select({ options, value, defaultValue, onValueChange, placeholder, variant = 'default', lead, disabled, name, open, defaultOpen, onOpenChange, className, style, ...aria }) {
    return (_jsxs(BaseSelect.Root, { items: options.map((o) => ({ value: o.value, label: o.label })), value: value, defaultValue: defaultValue, onValueChange: (next) => {
            if (next !== null)
                onValueChange?.(next);
        }, disabled: disabled, name: name, open: open, defaultOpen: defaultOpen, onOpenChange: (next) => onOpenChange?.(next), children: [_jsxs(BaseSelect.Trigger, { ...aria, className: cx('fa-select', variant === 'ghost' && 'fa-select--ghost', className), style: style, children: [lead, _jsx(BaseSelect.Value, { className: "lbl", placeholder: placeholder }), _jsx(BaseSelect.Icon, { render: _jsx("span", {}), children: _jsx(Icon, { name: "chevD" }) })] }), _jsx(BaseSelect.Portal, { children: _jsx(BaseSelect.Positioner, { alignItemWithTrigger: false, side: "bottom", align: "start", sideOffset: 4, collisionPadding: 8, children: _jsx(BaseSelect.Popup, { className: "fa-pop", style: { minWidth: 'var(--anchor-width)' }, children: _jsx(BaseSelect.List, { children: options.map((o) => (_jsxs(BaseSelect.Item, { value: o.value, disabled: o.disabled, className: "fa-item", children: [_jsx(BaseSelect.ItemText, { className: "grow", children: o.label }), _jsx(BaseSelect.ItemIndicator, { render: _jsx("span", { className: "tick" }), children: _jsx(Icon, { name: "check" }) })] }, o.value))) }) }) }) })] }));
}
