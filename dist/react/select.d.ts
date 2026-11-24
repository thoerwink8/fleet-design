import * as React from 'react';
import { type LayoutProps } from './internal.js';
export interface SelectOption<V extends string> {
    value: V;
    label: React.ReactNode;
    disabled?: boolean;
}
export interface SelectProps<V extends string> extends LayoutProps {
    options: readonly SelectOption<V>[];
    value?: V | null;
    defaultValue?: V | null;
    onValueChange?: (value: V) => void;
    placeholder?: React.ReactNode;
    /** `default`: framed, 32 high. `ghost`: no frame, 28 high, muted text, for pickers inside a composer or toolbar. */
    variant?: 'default' | 'ghost';
    /** Content before the value inside the trigger (an agent slot, an icon). */
    lead?: React.ReactNode;
    disabled?: boolean;
    name?: string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    'aria-label'?: string;
    /** Marks the trigger invalid: `aria-invalid` on it, same danger border as an invalid `Input`. */
    'aria-invalid'?: boolean;
    'aria-labelledby'?: string;
}
/**
 * A single-choice dropdown: `<Select options={[{ value: '15', label: '较大' }]} value={v} onValueChange={setV} aria-label="字号" />`.
 * The list opens under the trigger; arrow keys move, Enter picks, Esc closes and focus returns to the trigger.
 */
export declare function Select<V extends string>({ options, value, defaultValue, onValueChange, placeholder, variant, lead, disabled, name, open, defaultOpen, onOpenChange, className, style, ...aria }: SelectProps<V>): React.JSX.Element;
