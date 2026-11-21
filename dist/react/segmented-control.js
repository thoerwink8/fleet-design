import { jsx as _jsx } from "react/jsx-runtime";
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { cx } from './internal.js';
/**
 * One choice out of a few, always visible: `<SegmentedControl options={[{ value: 'day', label: '日' }]} value onValueChange />`.
 * A radio group: Tab enters at the checked item, arrow keys move and select.
 */
export function SegmentedControl({ options, value, defaultValue, onValueChange, disabled, name, className, style, ...aria }) {
    return (_jsx(RadioGroup, { ...aria, name: name, disabled: disabled, value: value, defaultValue: defaultValue, onValueChange: (next) => onValueChange?.(next), className: cx('fa-seg', className), style: style, children: options.map((o) => (_jsx(Radio.Root, { value: o.value, disabled: o.disabled, nativeButton: true, render: _jsx("button", { type: "button" }), children: o.label }, o.value))) }));
}
