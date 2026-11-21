import type * as React from 'react';
import { type LayoutProps } from './internal.js';
export interface SegmentedOption<V extends string> {
    value: V;
    label: React.ReactNode;
    disabled?: boolean;
}
export interface SegmentedControlProps<V extends string> extends LayoutProps {
    options: readonly SegmentedOption<V>[];
    value?: V;
    defaultValue?: V;
    onValueChange?: (value: V) => void;
    disabled?: boolean;
    /** Form field name; the value is submitted through a hidden input. */
    name?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
}
/**
 * One choice out of a few, always visible: `<SegmentedControl options={[{ value: 'day', label: '日' }]} value onValueChange />`.
 * A radio group: Tab enters at the checked item, arrow keys move and select.
 */
export declare function SegmentedControl<V extends string>({ options, value, defaultValue, onValueChange, disabled, name, className, style, ...aria }: SegmentedControlProps<V>): React.JSX.Element;
