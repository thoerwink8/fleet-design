import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Menu as BaseMenu } from '@base-ui/react/menu';
import * as React from 'react';
import { cx, Icon } from './internal.js';
function shortcutItems(entries, out = []) {
    for (const e of entries) {
        if (e.type === 'group')
            shortcutItems(e.items, out);
        else if ((e.type === undefined || e.type === 'item' || e.type === 'checkbox') && e.shortcut && !e.disabled)
            out.push(e);
    }
    return out;
}
function Key({ shortcut }) {
    return shortcut ? (_jsx("span", { className: "key", "aria-hidden": "true", children: shortcut })) : null;
}
function CheckboxEntry({ entry }) {
    return (_jsxs(BaseMenu.CheckboxItem, { nativeButton: true, render: _jsx("button", { type: "button" }), className: "fa-item", checked: entry.checked, defaultChecked: entry.defaultChecked, onCheckedChange: (checked) => entry.onCheckedChange?.(checked), disabled: entry.disabled, "aria-keyshortcuts": entry.shortcut, children: [_jsx("span", { className: "grow", children: entry.label }), _jsx("span", { className: "tick", children: _jsx(Icon, { name: "check" }) }), _jsx(Key, { shortcut: entry.shortcut })] }));
}
function Entries({ entries, width }) {
    return entries.map((e, i) => {
        const key = e.id ?? String(i);
        switch (e.type) {
            case 'separator':
                return _jsx(BaseMenu.Separator, { className: "fa-sep" }, key);
            case 'group':
                return (_jsxs(BaseMenu.Group, { children: [_jsx(BaseMenu.GroupLabel, { className: "fa-glabel", children: e.label }), _jsx(Entries, { entries: e.items, width: width })] }, key));
            case 'checkbox':
                return _jsx(CheckboxEntry, { entry: e }, key);
            case 'submenu':
                return (_jsxs(BaseMenu.SubmenuRoot, { children: [_jsxs(BaseMenu.SubmenuTrigger, { nativeButton: true, render: _jsx("button", { type: "button" }), className: "fa-item", disabled: e.disabled, children: [_jsx("span", { className: "grow", children: e.label }), _jsx("span", { className: "end", children: _jsx(Icon, { name: "chevR" }) })] }), _jsx(Popup, { entries: e.items, width: width, side: "right", align: "start", offset: 4 })] }, key));
            default:
                return (_jsxs(BaseMenu.Item, { nativeButton: true, render: _jsx("button", { type: "button" }), className: cx('fa-item', e.danger && 'fa-item--danger'), disabled: e.disabled, onClick: () => e.onSelect?.(), "aria-keyshortcuts": e.shortcut, children: [_jsx("span", { className: "grow", children: e.label }), e.end !== undefined && _jsx("span", { className: "end", children: e.end }), _jsx(Key, { shortcut: e.shortcut })] }, key));
        }
    });
}
function Popup({ entries, width, side, align, offset, label, }) {
    return (_jsx(BaseMenu.Portal, { children: _jsx(BaseMenu.Positioner, { side: side, align: align, sideOffset: offset, collisionPadding: 8, children: _jsx(BaseMenu.Popup, { className: "fa-pop", style: { width }, "aria-label": label, children: _jsx(Entries, { entries: entries, width: width }) }) }) }));
}
/**
 * An action menu from data: `<Menu trigger={<IconButton label="更多">…</IconButton>} items={[{ label: '置顶', shortcut: 'P', onSelect }]} />`.
 * Arrow keys move, Enter runs, Esc closes and returns focus to the trigger; checkbox items stay open when toggled.
 * For full control compose the Base UI parts with the same classes (`fa-pop`, `fa-item`, `fa-sep`, `fa-glabel`).
 */
export function Menu({ trigger, items, side = 'bottom', align = 'end', width = 248, open, defaultOpen = false, onOpenChange, 'aria-label': label, }) {
    const [inner, setInner] = React.useState(defaultOpen);
    const isOpen = open ?? inner;
    const setOpen = (next) => {
        if (open === undefined)
            setInner(next);
        onOpenChange?.(next);
    };
    // Single-letter shortcuts, live while the menu is open wherever focus is (the popup or its trigger).
    const latest = React.useRef({ items, setOpen });
    latest.current = { items, setOpen };
    React.useLayoutEffect(() => {
        if (!isOpen)
            return;
        const onKey = (event) => {
            if (event.altKey || event.ctrlKey || event.metaKey || event.key.length !== 1)
                return;
            const hit = shortcutItems(latest.current.items).find((k) => k.shortcut?.toLowerCase() === event.key.toLowerCase());
            if (!hit)
                return;
            event.preventDefault();
            event.stopPropagation();
            if (hit.type === 'checkbox') {
                // Only a controlled checkbox item can be toggled from here; an uncontrolled one keeps its own state.
                if (hit.checked !== undefined)
                    hit.onCheckedChange?.(!hit.checked);
            }
            else {
                hit.onSelect?.();
                latest.current.setOpen(false);
            }
        };
        document.addEventListener('keydown', onKey, true);
        return () => document.removeEventListener('keydown', onKey, true);
    }, [isOpen]);
    return (_jsxs(BaseMenu.Root, { open: isOpen, onOpenChange: (next) => setOpen(next), children: [_jsx(BaseMenu.Trigger, { render: trigger }), _jsx(Popup, { entries: items, width: width, side: side, align: align, offset: 4, label: label })] }));
}
