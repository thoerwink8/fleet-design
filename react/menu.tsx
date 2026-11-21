import { Menu as BaseMenu } from '@base-ui/react/menu';
import * as React from 'react';
import { cx, Icon } from './internal.js';

interface ItemBase {
  /** Stable key; defaults to the position. */
  id?: string;
  label: React.ReactNode;
  disabled?: boolean;
  /** Single letter, shown at the right edge. It works while the menu is open, without modifiers. */
  shortcut?: string;
}

export interface MenuActionItem extends ItemBase {
  type?: 'item';
  onSelect?: () => void;
  /** Muted trailing text (a count, a size). */
  end?: React.ReactNode;
  /** Delete-type actions: danger text, in their own last group. */
  danger?: boolean;
}

export interface MenuCheckboxItem extends ItemBase {
  type: 'checkbox';
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export interface MenuSeparator {
  type: 'separator';
  id?: string;
}

export interface MenuGroup {
  type: 'group';
  id?: string;
  label: React.ReactNode;
  items: readonly MenuEntry[];
}

export interface MenuSubmenu {
  type: 'submenu';
  id?: string;
  label: React.ReactNode;
  disabled?: boolean;
  items: readonly MenuEntry[];
}

export type MenuEntry = MenuActionItem | MenuCheckboxItem | MenuSeparator | MenuGroup | MenuSubmenu;

export interface MenuProps {
  /** The button that opens the menu. Must accept a ref and props (use `Button` or `IconButton`). */
  trigger: React.ReactElement;
  items: readonly MenuEntry[];
  /** `plain` (default): text-only items with 12px side padding, for context menus. `icons`: 8px padding for items that lead with an icon. */
  variant?: 'plain' | 'icons';
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  /** Popup width in px (layout only; default 248). */
  width?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  'aria-label'?: string;
}

function shortcutItems(entries: readonly MenuEntry[], out: (MenuActionItem | MenuCheckboxItem)[] = []) {
  for (const e of entries) {
    if (e.type === 'group') shortcutItems(e.items, out);
    else if ((e.type === undefined || e.type === 'item' || e.type === 'checkbox') && e.shortcut && !e.disabled) out.push(e);
  }
  return out;
}

function Key({ shortcut }: { shortcut?: string }) {
  return shortcut ? (
    <span className="key" aria-hidden="true">
      {shortcut}
    </span>
  ) : null;
}

function CheckboxEntry({ entry }: { entry: MenuCheckboxItem }) {
  return (
    <BaseMenu.CheckboxItem
      nativeButton
      render={<button type="button" />}
      className="fa-item"
      checked={entry.checked}
      defaultChecked={entry.defaultChecked}
      onCheckedChange={(checked) => entry.onCheckedChange?.(checked)}
      disabled={entry.disabled}
      aria-keyshortcuts={entry.shortcut}
    >
      <span className="grow">{entry.label}</span>
      <span className="tick">
        <Icon name="check" />
      </span>
      <Key shortcut={entry.shortcut} />
    </BaseMenu.CheckboxItem>
  );
}

function Entries({ entries, variant, width }: { entries: readonly MenuEntry[]; variant: 'plain' | 'icons'; width: number }) {
  return entries.map((e, i) => {
    const key = e.id ?? String(i);
    switch (e.type) {
      case 'separator':
        return <BaseMenu.Separator key={key} className="fa-sep" />;
      case 'group':
        return (
          <BaseMenu.Group key={key}>
            <BaseMenu.GroupLabel className="fa-glabel">{e.label}</BaseMenu.GroupLabel>
            <Entries entries={e.items} variant={variant} width={width} />
          </BaseMenu.Group>
        );
      case 'checkbox':
        return <CheckboxEntry key={key} entry={e} />;
      case 'submenu':
        return (
          <BaseMenu.SubmenuRoot key={key}>
            <BaseMenu.SubmenuTrigger nativeButton render={<button type="button" />} className="fa-item" disabled={e.disabled}>
              <span className="grow">{e.label}</span>
              <span className="end">
                <Icon name="chevR" />
              </span>
            </BaseMenu.SubmenuTrigger>
            <Popup entries={e.items} variant={variant} width={width} side="right" align="start" offset={4} />
          </BaseMenu.SubmenuRoot>
        );
      default:
        return (
          <BaseMenu.Item
            key={key}
            nativeButton
            render={<button type="button" />}
            className={cx('fa-item', e.danger && 'fa-item--danger')}
            disabled={e.disabled}
            onClick={() => e.onSelect?.()}
            aria-keyshortcuts={e.shortcut}
          >
            <span className="grow">{e.label}</span>
            {e.end !== undefined && <span className="end">{e.end}</span>}
            <Key shortcut={e.shortcut} />
          </BaseMenu.Item>
        );
    }
  });
}

function Popup({
  entries,
  variant,
  width,
  side,
  align,
  offset,
  label,
}: {
  entries: readonly MenuEntry[];
  variant: 'plain' | 'icons';
  width: number;
  side: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
  offset: number;
  label?: string;
}) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner side={side} align={align} sideOffset={offset} collisionPadding={8}>
        <BaseMenu.Popup className={cx('fa-pop', variant === 'plain' && 'fa-pop--plain')} style={{ width }} aria-label={label}>
          <Entries entries={entries} variant={variant} width={width} />
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

/**
 * An action menu from data: `<Menu trigger={<IconButton label="更多">…</IconButton>} items={[{ label: '置顶', shortcut: 'P', onSelect }]} />`.
 * Arrow keys move, Enter runs, Esc closes and returns focus to the trigger; checkbox items stay open when toggled.
 * For full control compose the Base UI parts with the same classes (`fa-pop`, `fa-item`, `fa-sep`, `fa-glabel`).
 */
export function Menu({
  trigger,
  items,
  variant = 'plain',
  side = 'bottom',
  align = 'end',
  width = 248,
  open,
  defaultOpen = false,
  onOpenChange,
  'aria-label': label,
}: MenuProps) {
  const [inner, setInner] = React.useState(defaultOpen);
  const isOpen = open ?? inner;
  const setOpen = (next: boolean) => {
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  };
  // Single-letter shortcuts, live while the menu is open wherever focus is (the popup or its trigger).
  const latest = React.useRef({ items, setOpen });
  latest.current = { items, setOpen };
  React.useLayoutEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.key.length !== 1) return;
      const hit = shortcutItems(latest.current.items).find((k) => k.shortcut?.toLowerCase() === event.key.toLowerCase());
      if (!hit) return;
      event.preventDefault();
      event.stopPropagation();
      if (hit.type === 'checkbox') {
        // Only a controlled checkbox item can be toggled from here; an uncontrolled one keeps its own state.
        if (hit.checked !== undefined) hit.onCheckedChange?.(!hit.checked);
      } else {
        hit.onSelect?.();
        latest.current.setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [isOpen]);
  return (
    <BaseMenu.Root open={isOpen} onOpenChange={(next) => setOpen(next)}>
      <BaseMenu.Trigger render={trigger} />
      <Popup entries={items} variant={variant} width={width} side={side} align={align} offset={4} label={label} />
    </BaseMenu.Root>
  );
}
