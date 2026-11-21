import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import * as React from 'react';
import { Button } from './button.js';

interface OpenState {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The button that opens it. Must accept a ref and props (use `Button`). Leave out when you open it from state. */
  trigger?: React.ReactElement;
}

const TABBABLE =
  'a[href],area[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),summary,iframe,audio[controls],video[controls],[contenteditable]:not([contenteditable="false"]),[tabindex]:not([tabindex="-1"])';

function isTabbableElement(el: HTMLElement, root: HTMLElement): boolean {
  if (el.matches(':disabled') || el.closest('[inert],[hidden]') || el.tabIndex < 0) return false;
  const cs = getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden') return false;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return false;
  if (el.tagName === 'SUMMARY') {
    const details = el.closest('details');
    if (!details || details.querySelector(':scope > summary') !== el) return false;
  }
  if (el instanceof HTMLInputElement && el.type === 'radio' && el.name) {
    const scope = el.form ?? root;
    const radios = [...scope.querySelectorAll<HTMLInputElement>('input[type="radio"]')].filter((r) => r.name === el.name && !r.disabled);
    const checked = radios.find((r) => r.checked);
    return (checked ?? radios[0]) === el;
  }
  return true;
}

function tabbables(root: HTMLElement): HTMLElement[] {
  const candidates = [...root.querySelectorAll<HTMLElement>(TABBABLE)].filter((el) => isTabbableElement(el, root));
  const positive = candidates.filter((el) => el.tabIndex > 0).sort((a, b) => a.tabIndex - b.tabIndex);
  const regular = candidates.filter((el) => el.tabIndex === 0);
  return [...positive, ...regular];
}

function trapTab(event: React.KeyboardEvent<HTMLElement>) {
  if (event.defaultPrevented || event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return;
  const popup = event.currentTarget;
  const list = tabbables(popup);
  if (list.length === 0) {
    event.preventDefault();
    popup.focus();
    return;
  }
  const first = list[0];
  const last = list[list.length - 1];
  if (!first || !last) return;
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (event.shiftKey) {
    if (!active || active === first || active === popup || !popup.contains(active)) {
      event.preventDefault();
      last.focus();
    }
  } else if (!active || active === last || !popup.contains(active)) {
    event.preventDefault();
    first.focus();
  }
}

export interface DialogProps extends OpenState {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Buttons at the bottom right, usually 取消 + one primary action. */
  footer?: React.ReactNode;
}

/**
 * A modal dialog for a short task: focus moves inside and is trapped, Esc or the scrim closes it, focus returns to
 * the trigger. `<Dialog trigger={<Button>重命名</Button>} title="重命名会话" footer={…}>…</Dialog>`.
 * Use `DialogClose` around a footer button to close it.
 */
export function Dialog({ open, defaultOpen, onOpenChange, trigger, title, description, children, footer }: DialogProps) {
  return (
    <BaseDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={(next) => onOpenChange?.(next)}>
      {trigger && <BaseDialog.Trigger render={trigger} />}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fa-backdrop" />
        <BaseDialog.Popup className="fa-dialog fa-dialog--modal" onKeyDown={trapTab}>
          <BaseDialog.Title>{title}</BaseDialog.Title>
          {description !== undefined && <BaseDialog.Description>{description}</BaseDialog.Description>}
          {children}
          {footer !== undefined && <div className="fa-dialog__foot">{footer}</div>}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

/** Closes the surrounding Dialog or Drawer when its child is clicked: `<DialogClose render={<Button>取消</Button>} />`. */
export const DialogClose = BaseDialog.Close;

export interface ConfirmDialogProps extends OpenState {
  title: React.ReactNode;
  description: React.ReactNode;
  /** What will be affected (the names being deleted); shown in a short scrolling list. */
  children?: React.ReactNode;
  /** Names the action and its object: "删除 4 个会话", never "确定". */
  confirmLabel: React.ReactNode;
  cancelLabel?: React.ReactNode;
  /** Irreversible actions use the danger button. */
  danger?: boolean;
  onConfirm: () => void;
}

/**
 * Confirmation before an irreversible action (prefer undo for anything reversible). Focus starts on 取消, Esc cancels,
 * and the scrim does not dismiss it: `<ConfirmDialog title="删除对话" description="删除后无法恢复。" confirmLabel="删除对话" danger onConfirm={del} />`.
 */
export function ConfirmDialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = '取消',
  danger = false,
  onConfirm,
}: ConfirmDialogProps) {
  const cancel = React.useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={(next) => onOpenChange?.(next)}>
      {trigger && <AlertDialog.Trigger render={trigger} />}
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fa-backdrop" />
        <AlertDialog.Popup className="fa-dialog fa-dialog--modal" initialFocus={cancel} onKeyDown={trapTab}>
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description>{description}</AlertDialog.Description>
          {children !== undefined && <div className="fa-names">{children}</div>}
          <div className="fa-dialog__foot">
            <AlertDialog.Close render={<Button variant="secondary" ref={cancel} />}>{cancelLabel}</AlertDialog.Close>
            <AlertDialog.Close render={<Button variant={danger ? 'danger' : 'primary'} />} onClick={onConfirm}>
              {confirmLabel}
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
