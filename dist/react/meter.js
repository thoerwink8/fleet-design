import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Meter as BaseMeter } from '@base-ui/react/meter';
import { cx } from './internal.js';
/**
 * A static measure of how full something is (context window, quota): `<Meter label="上下文占用" value={70} showValue />`.
 * Not a progress indicator for running work.
 */
export function Meter({ label, value, max = 100, size = 'default', showValue = false, segments, dangerAt = 0.95, className, style, }) {
    const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
    const meter = (_jsx(BaseMeter.Root, { value: value, max: max, "aria-label": label, render: size === 'thin' ? _jsx("span", {}) : undefined, className: cx('fa-meter', size === 'thin' && 'fa-meter--thin', segments && 'fa-meter--seg', !showValue && className), style: showValue ? undefined : style, children: segments ? (_jsxs(_Fragment, { children: [segments.map((s) => (_jsx("i", { className: `fa-s${s.series}`, style: { width: `${max > 0 ? (s.value / max) * 100 : 0}%` }, title: s.label }, s.label))), _jsx("i", {})] })) : (_jsx(BaseMeter.Indicator, { render: _jsx("i", {}), className: cx('fa-meter__fill', pct / 100 >= dangerAt && 'fa-meter__fill--full') })) }));
    if (!showValue)
        return meter;
    return (_jsxs("span", { className: cx('fa-row', className), style: { flexWrap: 'nowrap', ...style }, children: [meter, _jsxs("span", { className: "fa-num", children: [Math.round(pct), "%"] })] }));
}
