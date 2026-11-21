import type * as React from 'react';

/** Joins class names, skipping empty values. */
export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/**
 * Layout-only props passed to the root element. Use them to place a component (margin, width, grid area, flex),
 * never to change how it looks: colours, type and spacing come from the `.fa-*` classes.
 */
export interface LayoutProps {
  className?: string;
  style?: React.CSSProperties;
}

const PATHS = {
  check: <path d="M3.5 8.5l3 3 6-7" />,
  chevD: <path d="M4 6l4 4 4-4" />,
  chevR: <path d="M6 4l4 4-4 4" />,
  alert: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3.5M8 10.8v.01" />
    </>
  ),
  search: (
    <>
      <circle cx="7" cy="7" r="4" />
      <path d="M10 10l3.5 3.5" />
    </>
  ),
  x: <path d="M4 4l8 8M12 4l-8 8" />,
};

export type IconName = keyof typeof PATHS;

/** The 16px line icons the components need themselves (chevrons, check, alert). */
export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={cx('fa-ic', className)}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
