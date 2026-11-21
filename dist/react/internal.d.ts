import type * as React from 'react';
/** Joins class names, skipping empty values. */
export declare function cx(...names: (string | false | null | undefined)[]): string;
/**
 * Layout-only props passed to the root element. Use them to place a component (margin, width, grid area, flex),
 * never to change how it looks: colours, type and spacing come from the `.fa-*` classes.
 */
export interface LayoutProps {
    className?: string;
    style?: React.CSSProperties;
}
declare const PATHS: {
    check: React.JSX.Element;
    chevD: React.JSX.Element;
    chevR: React.JSX.Element;
    alert: React.JSX.Element;
    info: React.JSX.Element;
    warn: React.JSX.Element;
    search: React.JSX.Element;
    x: React.JSX.Element;
};
export type IconName = keyof typeof PATHS;
/** The 16px line icons the components need themselves (chevrons, check, alert). */
export declare function Icon({ name, className }: {
    name: IconName;
    className?: string;
}): React.JSX.Element;
export {};
