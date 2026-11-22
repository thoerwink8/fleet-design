import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import * as React from 'react';
import { cx, Icon } from './internal.js';

export interface CommandItem {
  id: string;
  /** First line, 14px. Searched. */
  title: string;
  /** Group heading the item is listed under. Items keep their order inside a group. */
  group?: string;
  /** Second line, 12px muted (a summary). Its presence makes the row a two- or three-line result. */
  summary?: React.ReactNode;
  /** Third line, left side (model, turns) and right side (workspace, branch). One line each; a long value is cut with an ellipsis and the full text goes to its tooltip when it is a string. */
  meta?: React.ReactNode;
  metaEnd?: React.ReactNode;
  /** Right end of the first line: a time, a shortcut. */
  end?: React.ReactNode;
  /** Icon or agent slot before the text. */
  lead?: React.ReactNode;
  /** Extra words that match this item but are not shown. */
  keywords?: string;
  disabled?: boolean;
  onRun: () => void;
}

export interface CommandPaletteProps {
  items: readonly CommandItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The button that opens it; usually it is opened from a shortcut by setting `open`. */
  trigger?: React.ReactElement;
  placeholder?: string;
  /** Accessible name of the palette and its input. */
  label?: string;
  emptyText?: React.ReactNode;
  /** Key hints in the footer; leave out for the default ↑↓ / Enter / Esc row. */
  footer?: React.ReactNode;
  /** Custom matching; the default matches every space-separated word against the title and keywords, ignoring case. */
  filter?: (item: CommandItem, query: string) => boolean;
}

const defaultFilter = (item: CommandItem, query: string) => {
  const hay = `${item.title} ${item.keywords ?? ''}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word));
};

function highlight(text: string, query: string): React.ReactNode {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return text;
  const lower = text.toLowerCase();
  const marks: [number, number][] = [];
  for (const w of words) {
    const at = lower.indexOf(w);
    if (at >= 0) marks.push([at, at + w.length]);
  }
  marks.sort((a, b) => a[0] - b[0]);
  const out: React.ReactNode[] = [];
  let pos = 0;
  for (const [from, to] of marks) {
    if (from < pos) continue;
    out.push(
      text.slice(pos, from),
      <mark key={from} className="fa-mark">
        {text.slice(from, to)}
      </mark>,
    );
    pos = to;
  }
  out.push(text.slice(pos));
  return out;
}

const DEFAULT_FOOTER = (
  <>
    <span>
      <span className="fa-kbd">↑↓</span>选择
    </span>
    <span>
      <span className="fa-kbd">Enter</span>打开
    </span>
    <span>
      <span className="fa-kbd">Esc</span>关闭
    </span>
  </>
);

/**
 * Search and run commands or jump to sessions: typing filters, ↑↓ move, Enter runs, Esc closes and focus returns.
 * `<CommandPalette open={open} onOpenChange={setOpen} items={[{ id: 'new', title: '新建会话', group: '命令', onRun }]} />`
 */
export function CommandPalette({
  items,
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  placeholder = '输入命令，或搜索会话…',
  label = '命令面板',
  emptyText = '没有匹配的结果',
  footer = DEFAULT_FOOTER,
  filter = defaultFilter,
}: CommandPaletteProps) {
  const [inner, setInner] = React.useState(defaultOpen ?? false);
  const isOpen = open ?? inner;
  const setOpen = (next: boolean) => {
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  };
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const listId = React.useId();
  const input = React.useRef<HTMLInputElement>(null);

  const shown = items.filter((i) => filter(i, query.trim()));
  const groups: { name: string | undefined; items: CommandItem[] }[] = [];
  for (const item of shown) {
    const g = groups.find((x) => x.name === item.group);
    if (g) g.items.push(item);
    else groups.push({ name: item.group, items: [item] });
  }
  const ordered = groups.flatMap((g) => g.items);
  const current = ordered[Math.min(active, ordered.length - 1)];
  const optionId = (item: CommandItem) => `${listId}-${item.id}`;

  React.useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);
  React.useEffect(() => {
    if (current) document.getElementById(optionId(current))?.scrollIntoView({ block: 'nearest' });
  });

  const run = (item: CommandItem | undefined) => {
    if (!item || item.disabled) return;
    setOpen(false);
    item.onRun();
  };
  const move = (by: number) => {
    if (!ordered.length) return;
    setActive((a) => (Math.min(a, ordered.length - 1) + by + ordered.length) % ordered.length);
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'ArrowDown') move(1);
    else if (event.key === 'ArrowUp') move(-1);
    else if (event.key === 'Home' && event.ctrlKey) setActive(0);
    else if (event.key === 'End' && event.ctrlKey) setActive(ordered.length - 1);
    else if (event.key === 'Enter') run(current);
    else return;
    event.preventDefault();
  };

  return (
    <BaseDialog.Root open={isOpen} onOpenChange={(next) => setOpen(next)}>
      {trigger && <BaseDialog.Trigger render={trigger} />}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fa-backdrop" />
        <BaseDialog.Popup className="fa-pop fa-cmd fa-cmd--modal" aria-label={label} initialFocus={input}>
          <div className="fa-cmd__in">
            <Icon name="search" />
            <input
              ref={input}
              role="combobox"
              aria-label={label}
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={current ? optionId(current) : undefined}
              autoComplete="off"
              spellCheck={false}
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
            />
          </div>
          <div className="fa-cmd__list" id={listId} role="listbox" aria-label={label}>
            {ordered.length === 0 && <div className="fa-cmd__empty">{emptyText}</div>}
            {groups.map((g, gi) => {
              const head = `${listId}-g${gi}`;
              return (
                // biome-ignore lint/a11y/useSemanticElements: an option group inside a listbox is role=group, not a fieldset
                <div key={g.name ?? gi} role="group" aria-labelledby={g.name ? head : undefined}>
                  {g.name && (
                    <div className="fa-glabel" id={head}>
                      {g.name}
                    </div>
                  )}
                  {g.items.map((item) => {
                    const on = item === current;
                    const rich = item.summary !== undefined || item.meta !== undefined || item.metaEnd !== undefined;
                    return (
                      // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard selection runs through the combobox input (aria-activedescendant)
                      <div
                        key={item.id}
                        id={optionId(item)}
                        role="option"
                        aria-selected={on}
                        aria-disabled={item.disabled || undefined}
                        data-active={on}
                        tabIndex={-1}
                        className={cx('fa-cmd__row', !rich && 'fa-cmd__row--1', item.lead !== undefined && 'has-lead')}
                        onMouseMove={() => !on && setActive(ordered.indexOf(item))}
                        onClick={() => run(item)}
                      >
                        {item.lead !== undefined && <span className="lead">{item.lead}</span>}
                        <div className="fa-cmd__body">
                          <div className="l l1">
                            <span className="x grow">{highlight(item.title, query.trim())}</span>
                            {item.end !== undefined && <span className="tm">{item.end}</span>}
                          </div>
                          {item.summary !== undefined && (
                            <div className="l l2">
                              <span className="x">{item.summary}</span>
                            </div>
                          )}
                          {(item.meta !== undefined || item.metaEnd !== undefined) && (
                            <div className="l l3">
                              <span className="lt">
                                <span className="x" title={typeof item.meta === 'string' ? item.meta : undefined}>
                                  {item.meta}
                                </span>
                              </span>
                              <span className="rt">
                                <span className="x" title={typeof item.metaEnd === 'string' ? item.metaEnd : undefined}>
                                  {item.metaEnd}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          {footer && <div className="fa-cmd__foot">{footer}</div>}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
