import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import * as React from 'react';
import { cx, Icon } from './internal.js';
const defaultFilter = (item, query) => {
    const hay = `${item.title} ${item.keywords ?? ''}`.toLowerCase();
    return query
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((word) => hay.includes(word));
};
function highlight(text, query) {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length)
        return text;
    const lower = text.toLowerCase();
    const marks = [];
    for (const w of words) {
        const at = lower.indexOf(w);
        if (at >= 0)
            marks.push([at, at + w.length]);
    }
    marks.sort((a, b) => a[0] - b[0]);
    const out = [];
    let pos = 0;
    for (const [from, to] of marks) {
        if (from < pos)
            continue;
        out.push(text.slice(pos, from), _jsx("mark", { className: "fa-mark", children: text.slice(from, to) }, from));
        pos = to;
    }
    out.push(text.slice(pos));
    return out;
}
const DEFAULT_FOOTER = (_jsxs(_Fragment, { children: [_jsxs("span", { children: [_jsx("span", { className: "fa-kbd", children: "\u2191\u2193" }), "\u9009\u62E9"] }), _jsxs("span", { children: [_jsx("span", { className: "fa-kbd", children: "Enter" }), "\u6253\u5F00"] }), _jsxs("span", { children: [_jsx("span", { className: "fa-kbd", children: "Esc" }), "\u5173\u95ED"] })] }));
/**
 * Search and run commands or jump to sessions: typing filters, ↑↓ move, Enter runs, Esc closes and focus returns.
 * `<CommandPalette open={open} onOpenChange={setOpen} items={[{ id: 'new', title: '新建会话', group: '命令', onRun }]} />`
 */
export function CommandPalette({ items, open, defaultOpen, onOpenChange, trigger, placeholder = '输入命令，或搜索会话…', label = '命令面板', emptyText = '没有匹配的结果', footer = DEFAULT_FOOTER, filter = defaultFilter, }) {
    const [inner, setInner] = React.useState(defaultOpen ?? false);
    const isOpen = open ?? inner;
    const setOpen = (next) => {
        if (open === undefined)
            setInner(next);
        onOpenChange?.(next);
    };
    const [query, setQuery] = React.useState('');
    const [active, setActive] = React.useState(0);
    const listId = React.useId();
    const input = React.useRef(null);
    const shown = items.filter((i) => filter(i, query.trim()));
    const groups = [];
    for (const item of shown) {
        const g = groups.find((x) => x.name === item.group);
        if (g)
            g.items.push(item);
        else
            groups.push({ name: item.group, items: [item] });
    }
    const ordered = groups.flatMap((g) => g.items);
    let index = Math.min(active, Math.max(ordered.length - 1, 0));
    if (ordered[index]?.disabled) {
        const next = ordered.findIndex((item) => !item.disabled);
        if (next >= 0 && next !== active) {
            setActive(next);
            index = next;
        }
    }
    const current = ordered[index];
    const highlighted = current && !current.disabled ? current : undefined;
    const optionId = (item) => `${listId}-${item.id}`;
    React.useEffect(() => {
        if (!isOpen)
            setQuery('');
    }, [isOpen]);
    React.useEffect(() => {
        if (highlighted)
            document.getElementById(optionId(highlighted))?.scrollIntoView({ block: 'nearest' });
    });
    const run = (item) => {
        if (!item || item.disabled)
            return;
        setOpen(false);
        item.onRun();
    };
    const move = (by) => {
        const idxs = ordered.flatMap((item, i) => (item.disabled ? [] : [i]));
        if (!idxs.length)
            return;
        setActive((a) => {
            const cur = Math.min(a, ordered.length - 1);
            let pos = idxs.indexOf(cur);
            if (pos < 0)
                pos = by > 0 ? -1 : 0;
            return idxs[(pos + by + idxs.length) % idxs.length] ?? a;
        });
    };
    const onKeyDown = (event) => {
        if (event.nativeEvent.isComposing)
            return;
        if (event.key === 'ArrowDown')
            move(1);
        else if (event.key === 'ArrowUp')
            move(-1);
        else if (event.key === 'Home' && event.ctrlKey) {
            const first = ordered.findIndex((item) => !item.disabled);
            if (first >= 0)
                setActive(first);
        }
        else if (event.key === 'End' && event.ctrlKey) {
            let last = -1;
            ordered.forEach((item, i) => {
                if (!item.disabled)
                    last = i;
            });
            if (last >= 0)
                setActive(last);
        }
        else if (event.key === 'Enter')
            run(highlighted);
        else
            return;
        event.preventDefault();
    };
    return (_jsxs(BaseDialog.Root, { open: isOpen, onOpenChange: (next) => setOpen(next), children: [trigger && _jsx(BaseDialog.Trigger, { render: trigger }), _jsxs(BaseDialog.Portal, { children: [_jsx(BaseDialog.Backdrop, { className: "fa-backdrop" }), _jsxs(BaseDialog.Popup, { className: "fa-pop fa-cmd fa-cmd--modal", "aria-label": label, initialFocus: input, children: [_jsxs("div", { className: "fa-cmd__in", children: [_jsx(Icon, { name: "search" }), _jsx("input", { ref: input, role: "combobox", "aria-label": label, "aria-expanded": "true", "aria-controls": listId, "aria-autocomplete": "list", "aria-activedescendant": highlighted ? optionId(highlighted) : undefined, autoComplete: "off", spellCheck: false, placeholder: placeholder, value: query, onChange: (e) => {
                                            setQuery(e.target.value);
                                            setActive(0);
                                        }, onKeyDown: onKeyDown })] }), _jsxs("div", { className: "fa-cmd__list", id: listId, role: "listbox", "aria-label": label, children: [ordered.length === 0 && _jsx("div", { className: "fa-cmd__empty", children: emptyText }), groups.map((g, gi) => {
                                        const head = `${listId}-g${gi}`;
                                        return (_jsxs("div", { role: "group", "aria-labelledby": g.name ? head : undefined, children: [g.name && (_jsx("div", { className: "fa-glabel", id: head, children: g.name })), g.items.map((item) => {
                                                    const on = item === highlighted;
                                                    const rich = item.summary !== undefined || item.meta !== undefined || item.metaEnd !== undefined;
                                                    return (_jsxs("div", { id: optionId(item), role: "option", "aria-selected": on, "aria-disabled": item.disabled || undefined, "data-active": on, tabIndex: -1, className: cx('fa-cmd__row', !rich && 'fa-cmd__row--1', item.summary !== undefined && item.meta === undefined && item.metaEnd === undefined && 'fa-cmd__row--2', item.lead !== undefined && 'has-lead'), onMouseMove: () => {
                                                            if (item.disabled || on)
                                                                return;
                                                            setActive(ordered.indexOf(item));
                                                        }, onClick: () => run(item), children: [item.lead !== undefined && _jsx("span", { className: "lead", children: item.lead }), _jsxs("div", { className: "fa-cmd__body", children: [_jsxs("div", { className: "l l1", children: [_jsx("span", { className: "x grow", children: highlight(item.title, query.trim()) }), item.end !== undefined && _jsx("span", { className: "tm", children: item.end })] }), item.summary !== undefined && (_jsx("div", { className: "l l2", children: _jsx("span", { className: "x", children: item.summary }) })), (item.meta !== undefined || item.metaEnd !== undefined) && (_jsxs("div", { className: "l l3", children: [_jsx("span", { className: "lt", children: _jsx("span", { className: "x", title: typeof item.meta === 'string' ? item.meta : undefined, children: item.meta }) }), _jsx("span", { className: "rt", children: _jsx("span", { className: "x", title: typeof item.metaEnd === 'string' ? item.metaEnd : undefined, children: item.metaEnd }) })] }))] })] }, item.id));
                                                })] }, g.name ?? gi));
                                    })] }), footer && _jsx("div", { className: "fa-cmd__foot", children: footer })] })] })] }));
}
