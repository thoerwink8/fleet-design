import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import type * as React from 'react';
import { cx, Icon, type LayoutProps } from './internal.js';

export interface CollapsibleProps extends LayoutProps {
  /** What the head says. For `fold`, a summary of what is inside ("跑了 12 条命令，读了 5 个文件"). */
  title: React.ReactNode;
  /** `section`: a 32px section head in a details panel (put sections inside `DetailsPanel`). `fold`: a quiet 28px summary line that folds a list of steps or tool calls in a conversation. */
  variant?: 'section' | 'fold';
  /** Muted value at the right end of a section head (a count, a size). */
  aside?: React.ReactNode;
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

/**
 * Shows and hides one block: `<Collapsible title="环境" defaultOpen>…</Collapsible>`. The head is a button with
 * `aria-expanded`; Enter and Space toggle it.
 */
export function Collapsible({
  title,
  variant = 'section',
  aside,
  children,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  className,
  style,
}: CollapsibleProps) {
  const fold = variant === 'fold';
  return (
    <BaseCollapsible.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
      disabled={disabled}
      className={cx(fold ? 'fa-fold' : 'fa-dp__sec', className)}
      style={style}
    >
      <BaseCollapsible.Trigger className={fold ? 'fa-fold__sum' : 'fa-dp__head'}>
        {fold ? <Icon name="chevR" /> : <Icon name="chevR" className="chev" />}
        {title}
        {!fold && aside !== undefined && <span className="aside">{aside}</span>}
      </BaseCollapsible.Trigger>
      <BaseCollapsible.Panel className={fold ? 'fa-fold__list' : 'body'}>{children}</BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  );
}

export interface DetailsPanelProps extends LayoutProps {
  children?: React.ReactNode;
  /** As the right column of a page: no card frame, sections split by hairlines only. */
  side?: boolean;
  'aria-label'?: string;
}

/** The card that holds `Collapsible` sections (variant `section`). */
export function DetailsPanel({ children, side = false, className, style, ...aria }: DetailsPanelProps) {
  return (
    <div {...aria} className={cx('fa-dp', side && 'fa-dp--side', className)} style={style}>
      {children}
    </div>
  );
}
