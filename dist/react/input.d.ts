import * as React from 'react';
import { type LayoutProps } from './internal.js';
type NativeInputProps = Omit<React.ComponentPropsWithoutRef<'input'>, 'className' | 'style' | 'prefix' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'disabled'>;
export interface InputProps extends NativeInputProps, LayoutProps {
    label?: React.ReactNode;
    /** Helper text under the input, linked with `aria-describedby`. */
    hint?: React.ReactNode;
    /** Error text. When set, the input is invalid (`aria-invalid`) and the error replaces the hint. */
    error?: React.ReactNode;
    /** Text or icon inside the frame, before the value (unit, protocol, search icon). */
    prefix?: React.ReactNode;
    /** Text or icon inside the frame, after the value. */
    suffix?: React.ReactNode;
    /** Monospace value, for paths, branch names and IDs only. */
    mono?: boolean;
    disabled?: boolean;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}
/** A labelled text field: `<Input label="分支名" value={v} onValueChange={setV} error={bad && '不能有空格'} />`. */
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
export {};
