import * as React from 'react';
import { type LayoutProps } from './internal.js';
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
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export interface IconButtonProps extends Omit<NativeButtonProps, 'aria-label'>, LayoutProps {
    /** Accessible name; icon buttons have no visible text. */
    label: string;
}
/** The 28px quiet icon button used inside rows and bars: `<IconButton label="归档"><ArchiveIcon /></IconButton>`. */
export declare const IconButton: React.ForwardRefExoticComponent<IconButtonProps & React.RefAttributes<HTMLButtonElement>>;
export {};
