import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import type * as React from 'react';
import { cx, Icon, type LayoutProps } from './internal.js';

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
export function Checkbox({
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  indeterminate,
  disabled,
  name,
  value,
  className,
  style,
  ...aria
}: CheckboxProps) {
  const box = (
    <BaseCheckbox.Root
      {...aria}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(next) => onCheckedChange?.(next)}
      indeterminate={indeterminate}
      disabled={disabled}
      name={name}
      value={value}
      className={cx('fa-checkbox', label === undefined && className)}
      style={label === undefined ? style : undefined}
    >
      <BaseCheckbox.Indicator render={<span style={{ display: 'contents' }} />}>
        {indeterminate ? (
          <svg
            className="fa-ic"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 8h8" />
          </svg>
        ) : (
          <Icon name="check" />
        )}
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
  if (label === undefined) return box;
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the Base UI checkbox inside is the control
    <label className={cx('fa-check-label', className)} style={style}>
      {box}
      {label}
    </label>
  );
}
