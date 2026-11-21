import type * as React from 'react';
import { type LayoutProps } from './internal.js';
export interface CheckboxProps extends LayoutProps {
    /** Text after the box; the whole line becomes the click target. Without it, give the box an `aria-label`. */
    label?: React.ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    /** Some but not all of a group are checked. */
    indeterminate?: boolean;
    disabled?: boolean;
    name?: string;
    value?: string;
    'aria-label'?: string;
}
/** A checkbox: `<Checkbox label="闲置时释放内存" checked={on} onCheckedChange={setOn} />`. Space toggles it. */
export declare function Checkbox({ label, checked, defaultChecked, onCheckedChange, indeterminate, disabled, name, value, className, style, ...aria }: CheckboxProps): React.JSX.Element;
