import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Field } from '@base-ui/react/field';
import * as React from 'react';
import { cx, Icon } from './internal.js';
/** A labelled text field: `<Input label="分支名" value={v} onValueChange={setV} error={bad && '不能有空格'} />`. */
export const Input = React.forwardRef(function Input({ label, hint, error, prefix, suffix, mono = false, disabled = false, value, defaultValue, onValueChange, className, style, ...rest }, ref) {
    const invalid = error !== undefined && error !== null && error !== false;
    const grouped = prefix !== undefined || suffix !== undefined;
    const control = (_jsx(Field.Control, { ref: ref, ...rest, value: value, defaultValue: defaultValue, onValueChange: (next) => onValueChange?.(String(next)), className: cx(grouped ? 'fa-input__control' : 'fa-input', mono && 'fa-mono') }));
    return (_jsxs(Field.Root, { invalid: invalid, disabled: disabled, className: cx('fa-field', className), style: style, children: [label !== undefined && _jsx(Field.Label, { children: label }), grouped ? (_jsxs("div", { className: "fa-input fa-input--group", children: [prefix !== undefined && _jsx("span", { className: "fa-input__affix", children: prefix }), control, suffix !== undefined && _jsx("span", { className: "fa-input__affix", children: suffix })] })) : (control), invalid ? (_jsxs(Field.Description, { className: "fa-hint fa-hint--error", render: _jsx("div", {}), children: [_jsx(Icon, { name: "alert" }), _jsx("span", { children: error })] })) : (hint !== undefined && (_jsx(Field.Description, { className: "fa-hint", render: _jsx("div", {}), children: hint })))] }));
});
