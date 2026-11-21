import { Button as BaseButton } from '@base-ui/react/button';
import * as React from 'react';
import { cx, type LayoutProps } from './internal.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'stop';
export type ButtonSize = 'sm' | 'md' | 'lg';

type NativeButtonProps = Omit<React.ComponentPropsWithoutRef<'button'>, 'className' | 'style'>;

export interface ButtonProps extends NativeButtonProps, LayoutProps {
  /** `ghost` (default) is the quiet text button; `danger` belongs in confirm dialogs; `stop` is the square stop-run button. */
  variant?: ButtonVariant;
  /** 28 / 32 / 40. `sm` is for secondary buttons grouped in a toolbar or strip that is itself at least 32 high. */
  size?: ButtonSize;
  /** Square icon-only button. Give it an `aria-label`. */
  icon?: boolean;
  /** Busy: the button stays focusable, ignores clicks, sets `aria-busy` and shows `loadingText`. No spinner. */
  loading?: boolean;
  /** What the label turns into while busy, a present-progressive verb with an ellipsis ("压缩中…"). */
  loadingText?: React.ReactNode;
}

/** A button: `<Button variant="primary" size="sm">发送</Button>`. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'ghost',
    size = 'md',
    icon = false,
    loading = false,
    loadingText,
    disabled = false,
    type = 'button',
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <BaseButton
      ref={ref}
      type={type}
      {...rest}
      disabled={disabled || loading}
      focusableWhenDisabled={loading && !disabled}
      aria-busy={loading || undefined}
      className={cx(
        'fa-btn',
        variant !== 'ghost' && `fa-btn--${variant}`,
        size !== 'md' && `fa-btn--${size}`,
        icon && variant !== 'stop' && 'fa-btn--icon',
        className,
      )}
    >
      {loading && loadingText !== undefined ? loadingText : children}
    </BaseButton>
  );
});

export interface IconButtonProps extends Omit<NativeButtonProps, 'aria-label'>, LayoutProps {
  /** Accessible name; icon buttons have no visible text. */
  label: string;
}

/** The 28px quiet icon button used inside rows and bars: `<IconButton label="归档"><ArchiveIcon /></IconButton>`. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, type = 'button', className, children, ...rest },
  ref,
) {
  return (
    <BaseButton ref={ref} type={type} {...rest} aria-label={label} className={cx('fa-icon-btn', className)}>
      {children}
    </BaseButton>
  );
});
