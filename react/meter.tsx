import { Meter as BaseMeter } from '@base-ui/react/meter';
import { cx, type LayoutProps } from './internal.js';

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
export function Meter({
  label,
  value,
  max = 100,
  size = 'default',
  showValue = false,
  segments,
  dangerAt = 0.95,
  className,
  style,
}: MeterProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const meter = (
    <BaseMeter.Root
      value={value}
      max={max}
      aria-label={label}
      render={size === 'thin' ? <span /> : undefined}
      className={cx('fa-meter', size === 'thin' && 'fa-meter--thin', segments && 'fa-meter--seg', !showValue && className)}
      style={showValue ? undefined : style}
    >
      {segments ? (
        <>
          {segments.map((s) => (
            <i key={s.label} className={`fa-s${s.series}`} style={{ width: `${max > 0 ? (s.value / max) * 100 : 0}%` }} title={s.label} />
          ))}
          <i />
        </>
      ) : (
        <BaseMeter.Indicator render={<i />} className={cx('fa-meter__fill', pct / 100 >= dangerAt && 'fa-meter__fill--full')} />
      )}
    </BaseMeter.Root>
  );
  if (!showValue) return meter;
  return (
    <span className={cx('fa-row', className)} style={{ flexWrap: 'nowrap', ...style }}>
      {meter}
      <span className="fa-num">{Math.round(pct)}%</span>
    </span>
  );
}
