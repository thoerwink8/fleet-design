import type * as React from 'react';
import { type LayoutProps } from './internal.js';
export interface MeterSegment {
    label: string;
    value: number;
    /** Data colour 1-6 in order; 7 is the grey "other" for everything after the sixth category. */
    series: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}
export interface MeterProps extends LayoutProps {
    /** Accessible name ("上下文占用"). */
    label: string;
    value: number;
    max?: number;
    /** `thin`: 4px x 64px, for a strip or a header. `default`: 8px, full width. */
    size?: 'default' | 'thin';
    /** Show the percentage after the bar, in tabular figures. */
    showValue?: boolean;
    /** Split the filled part into categories (context breakdown). Each still needs its name and number in a legend. */
    segments?: readonly MeterSegment[];
    /** Fraction at which the fill turns to danger (default 0.95). */
    dangerAt?: number;
}
/**
 * A static measure of how full something is (context window, quota): `<Meter label="上下文占用" value={70} showValue />`.
 * Not a progress indicator for running work.
 */
export declare function Meter({ label, value, max, size, showValue, segments, dangerAt, className, style, }: MeterProps): React.JSX.Element;
