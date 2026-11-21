import { jsx as _jsx } from "react/jsx-runtime";
import { Button as BaseButton } from '@base-ui/react/button';
import * as React from 'react';
import { cx } from './internal.js';
/** A button: `<Button variant="primary" size="sm">发送</Button>`. */
export const Button = React.forwardRef(function Button({ variant = 'ghost', size = 'md', icon = false, loading = false, loadingText, disabled = false, type = 'button', className, children, ...rest }, ref) {
    return (_jsx(BaseButton, { ref: ref, type: type, ...rest, disabled: disabled || loading, focusableWhenDisabled: loading && !disabled, "aria-busy": loading || undefined, className: cx('fa-btn', variant !== 'ghost' && `fa-btn--${variant}`, size !== 'md' && `fa-btn--${size}`, icon && variant !== 'stop' && 'fa-btn--icon', className), children: loading && loadingText !== undefined ? loadingText : children }));
});
/** The 28px quiet icon button used inside rows and bars: `<IconButton label="归档"><ArchiveIcon /></IconButton>`. */
export const IconButton = React.forwardRef(function IconButton({ label, type = 'button', className, children, ...rest }, ref) {
    return (_jsx(BaseButton, { ref: ref, type: type, ...rest, "aria-label": label, className: cx('fa-icon-btn', className), children: children }));
});
