import { Field } from '@base-ui/react/field';
import * as React from 'react';
import { cx, Icon, type LayoutProps } from './internal.js';

type NativeInputProps = Omit<
  React.ComponentPropsWithoutRef<'input'>,
  'className' | 'style' | 'prefix' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'disabled'
>;

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
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, prefix, suffix, mono = false, disabled = false, value, defaultValue, onValueChange, className, style, ...rest },
  ref,
) {
  const invalid = error !== undefined && error !== null && error !== false;
  const grouped = prefix !== undefined || suffix !== undefined;
  const control = (
    <Field.Control
      ref={ref}
      {...rest}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(String(next))}
      className={cx(grouped ? 'fa-input__control' : 'fa-input', mono && 'fa-mono')}
    />
  );
  return (
    <Field.Root invalid={invalid} disabled={disabled} className={cx('fa-field', className)} style={style}>
      {label !== undefined && <Field.Label>{label}</Field.Label>}
      {grouped ? (
        <div className="fa-input fa-input--group">
          {prefix !== undefined && <span className="fa-input__affix">{prefix}</span>}
          {control}
          {suffix !== undefined && <span className="fa-input__affix">{suffix}</span>}
        </div>
      ) : (
        control
      )}
      {invalid ? (
        <Field.Description className="fa-hint fa-hint--error" render={<div />}>
          <Icon name="alert" />
          <span>{error}</span>
        </Field.Description>
      ) : (
        hint !== undefined && (
          <Field.Description className="fa-hint" render={<div />}>
            {hint}
          </Field.Description>
        )
      )}
    </Field.Root>
  );
});
