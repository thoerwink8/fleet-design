import { Select as BaseSelect } from '@base-ui/react/select';
import * as React from 'react';
import { cx, Icon, type LayoutProps } from './internal.js';

export interface SelectOption<V extends string> {
  value: V;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps<V extends string> extends LayoutProps {
  options: readonly SelectOption<V>[];
  value?: V | null;
  defaultValue?: V | null;
  onValueChange?: (value: V) => void;
  placeholder?: React.ReactNode;
  /** `default`: framed, 32 high. `ghost`: no frame, 28 high, muted text, for pickers inside a composer or toolbar. */
  variant?: 'default' | 'ghost';
  /** `sm`: framed, 28 high, for a toolbar. `md` (default) is 32. */
  size?: 'md' | 'sm';
  /** Content before the value inside the trigger (an agent slot, an icon). */
  lead?: React.ReactNode;
  disabled?: boolean;
  name?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  'aria-label'?: string;
  /** Marks the trigger invalid: `aria-invalid` on it, same danger border as an invalid `Input`. */
  'aria-invalid'?: boolean;
  'aria-labelledby'?: string;
}

/**
 * A single-choice dropdown: `<Select options={[{ value: '15', label: '较大' }]} value={v} onValueChange={setV} aria-label="字号" />`.
 * The list opens under the trigger; arrow keys move, Enter picks, Esc closes and focus returns to the trigger.
 */
export function Select<V extends string>({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  variant = 'default',
  size = 'md',
  lead,
  disabled,
  name,
  open,
  defaultOpen,
  onOpenChange,
  className,
  style,
  ...aria
}: SelectProps<V>) {
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen ?? false);
  const isOpen = open ?? innerOpen;
  const openRef = React.useRef(isOpen);
  openRef.current = isOpen;
  const [portalOpen, setPortalOpen] = React.useState(isOpen);
  if (isOpen && !portalOpen) setPortalOpen(true);

  return (
    <BaseSelect.Root
      items={options.map((o) => ({ value: o.value, label: o.label }))}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => {
        if (next !== null) onValueChange?.(next as V);
      }}
      disabled={disabled}
      name={name}
      open={isOpen}
      onOpenChange={(next) => {
        if (open === undefined) setInnerOpen(next);
        if (next) setPortalOpen(true);
        onOpenChange?.(next);
      }}
      onOpenChangeComplete={(next) => {
        if (!next && !openRef.current) setPortalOpen(false);
      }}
    >
      <BaseSelect.Trigger
        {...aria}
        className={cx('fa-select', size === 'sm' && 'fa-select--sm', variant === 'ghost' && 'fa-select--ghost', className)}
        style={style}
      >
        {lead}
        <BaseSelect.Value className="lbl" placeholder={placeholder} />
        <BaseSelect.Icon render={<span />}>
          <Icon name="chevD" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      {portalOpen && (
        <BaseSelect.Portal>
          <BaseSelect.Positioner alignItemWithTrigger={false} side="bottom" align="start" sideOffset={4} collisionPadding={8}>
            <BaseSelect.Popup className="fa-pop" style={{ minWidth: 'var(--anchor-width)' }}>
              <BaseSelect.List>
                {options.map((o) => (
                  <BaseSelect.Item key={o.value} value={o.value} disabled={o.disabled} className="fa-item">
                    <BaseSelect.ItemText className="grow">{o.label}</BaseSelect.ItemText>
                    <BaseSelect.ItemIndicator render={<span className="tick" />}>
                      <Icon name="check" />
                    </BaseSelect.ItemIndicator>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      )}
    </BaseSelect.Root>
  );
}
