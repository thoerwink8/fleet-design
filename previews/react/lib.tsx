import { type ReactNode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function Ready({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.dataset.ready = '1';
  }, []);
  return <div className="fa-stage">{children}</div>;
}

/** Renders a React preview page into #root and marks the body ready for the browser checks. */
export function mount(node: ReactNode) {
  const el = document.getElementById('root');
  if (!el) throw new Error('no #root');
  createRoot(el).render(<Ready>{node}</Ready>);
}

/** A captioned demo block, the same layout as the static cards. */
export function Demo({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="fa-col">
      <div className="fa-cap">{caption}</div>
      {children}
    </div>
  );
}

/** The feedback line under a demo; tests read what happened from it. */
export function Say({ children }: { children: ReactNode }) {
  return (
    <div className="fa-hint" role="status" data-testid="say">
      {children}
    </div>
  );
}
