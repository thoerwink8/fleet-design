import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { cx, Icon } from './internal.js';
/** A checkbox: `<Checkbox label="闲置时释放内存" checked={on} onCheckedChange={setOn} />`. Space toggles it. */
export function Checkbox({ label, checked, defaultChecked, onCheckedChange, indeterminate, disabled, name, value, className, style, ...aria }) {
    const box = (_jsx(BaseCheckbox.Root, { ...aria, checked: checked, defaultChecked: defaultChecked, onCheckedChange: (next) => onCheckedChange?.(next), indeterminate: indeterminate, disabled: disabled, name: name, value: value, className: cx('fa-checkbox', label === undefined && className), style: label === undefined ? style : undefined, children: _jsx(BaseCheckbox.Indicator, { render: _jsx("span", { style: { display: 'contents' } }), children: indeterminate ? (_jsx("svg", { className: "fa-ic", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", "aria-hidden": "true", children: _jsx("path", { d: "M4 8h8" }) })) : (_jsx(Icon, { name: "check" })) }) }));
    if (label === undefined)
        return box;
    return (_jsxs("label", { className: cx('fa-check-label', className), style: style, children: [box, label] }));
}
