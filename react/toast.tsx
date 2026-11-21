import { Toast as BaseToast } from '@base-ui/react/toast';
import type * as React from 'react';
import { Icon, type IconName } from './internal.js';

export type ToastKind = 'success' | 'info' | 'danger' | 'warning';

export interface ToastOptions {
  /** One short sentence: what just happened ("已归档「排查登录超时」"). */
  text: React.ReactNode;
  /** Colour of the leading mark only; the text stays `--fg`. */
  kind?: ToastKind;
  /** Replaces the default mark icon. */
  icon?: React.ReactNode;
  /** One action, usually 撤销 (undo). A toast with an action stays 8 s instead of 4 s. */
  action?: { label: React.ReactNode; onClick: () => void };
  /** Milliseconds before it leaves; 0 keeps it until closed. Default 4000, or 8000 with an action. */
  timeout?: number;
}

interface ToastData {
  kind: ToastKind;
  icon?: React.ReactNode;
}

const MARK: Record<ToastKind, IconName> = { success: 'check', info: 'alert', danger: 'alert', warning: 'alert' };

function ToastList({ closeLabel }: { closeLabel: string }) {
  const { toasts } = BaseToast.useToastManager<ToastData>();
  return toasts.map((t) => (
    <BaseToast.Root key={t.id} toast={t} className="fa-toast">
      <span className={`m-${t.data?.kind ?? 'info'}`}>{t.data?.icon ?? <Icon name={MARK[t.data?.kind ?? 'info']} />}</span>
      <BaseToast.Title className="grow" render={<span />} />
      <BaseToast.Action className="fa-btn fa-btn--sm" />
      <BaseToast.Close className="fa-icon-btn" aria-label={closeLabel}>
        <Icon name="x" />
      </BaseToast.Close>
    </BaseToast.Root>
  ));
}

export interface ToastProviderProps {
  children?: React.ReactNode;
  /** At most this many toasts are shown; the oldest leaves first (default 3). */
  limit?: number;
  /** Accessible name of the close button on each toast. */
  closeLabel?: string;
  /** Accessible name of the notification region. */
  label?: string;
}

/**
 * Put once near the app root: it holds the queue and renders the stack at the bottom right, outside the composer.
 * Timers pause while the pointer is over a toast or focus is inside one.
 */
export function ToastProvider({ children, limit = 3, closeLabel = '关闭', label = '通知' }: ToastProviderProps) {
  return (
    <BaseToast.Provider limit={limit}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport className="fa-toasts" aria-label={label}>
          <ToastList closeLabel={closeLabel} />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}

/**
 * Shows short confirmations of what just happened, with undo where possible:
 * `const toast = useToast(); toast.show({ text: '已归档', action: { label: '撤销', onClick: restore } })`.
 * Errors do not go here: they belong in the status strip above the composer.
 */
export function useToast() {
  const manager = BaseToast.useToastManager<ToastData>();
  return {
    show({ text, kind = 'info', icon, action, timeout }: ToastOptions): string {
      return manager.add({
        title: text,
        type: kind,
        timeout: timeout ?? (action ? 8000 : 4000),
        data: { kind, icon },
        actionProps: action ? { children: action.label, onClick: action.onClick } : undefined,
      });
    },
    close(id: string) {
      manager.close(id);
    },
  };
}
