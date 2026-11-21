import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Joins class names, skipping empty values. */
export function cx(...names) {
    return names.filter(Boolean).join(' ');
}
const PATHS = {
    check: _jsx("path", { d: "M3.5 8.5l3 3 6-7" }),
    chevD: _jsx("path", { d: "M4 6l4 4 4-4" }),
    chevR: _jsx("path", { d: "M6 4l4 4-4 4" }),
    alert: (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "8", cy: "8", r: "6" }), _jsx("path", { d: "M8 5v3.5M8 10.8v.01" })] })),
    search: (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "7", cy: "7", r: "4" }), _jsx("path", { d: "M10 10l3.5 3.5" })] })),
    x: _jsx("path", { d: "M4 4l8 8M12 4l-8 8" }),
};
/** The 16px line icons the components need themselves (chevrons, check, alert). */
export function Icon({ name, className }) {
    return (_jsx("svg", { className: cx('fa-ic', className), viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: PATHS[name] }));
}
