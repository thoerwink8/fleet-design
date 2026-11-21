import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import { splitList } from '../lib/css.mjs';
import { styleFiles, stylesDir } from '../lib/styles.mjs';
import { cssVar, PREFIX, tokensJson } from '../lib/tokens.mjs';

export const FONT_SIZES = [12, 14, 15, 18, 20];
export const MAX_WEIGHT = 500;

// Monospace is for code only: commands, paths, branch names, IDs and raw output.
export const MONO_ALLOWED = ['.fa-mono', '.fa-cmd__row .mono', '.fa-kv .v--mono', '.fa-fold__cmd', '.fa-fold__out', '.fa-chg .s .id'];

// Literal lengths in the finalized styles that are not multiples of 4 (hairline gaps and the three-dot indicator).
// They are kept as they are; any new one fails the check.
export const SPACING_EXCEPTIONS = [
  ['.fa-meter--seg', 'gap', '1px'],
  ['.fa-trend', 'gap', '1px'],
  ['.fa-dots3', 'gap', '3px'],
  ['.fa-trend i[data-ev]::after', 'margin-left', '-3px'],
];

// Row heights with a spec of their own. The table row (40) is the only one that is neither row-1 nor row-2/3;
// it must come from its token, and the token is not used outside tables.
export const ROW_SPECS = [['.fa-table td', 'height', 'var(--fa-row-table)']];

// The only looping animation: the in-turn indicator, which steps and stops under reduced motion. No spinners.
export const LOOP_ALLOWED = ['.fa-dots3 i'];

const SPACING_PROPS = /^(padding|margin)(-(top|right|bottom|left|block|inline)(-(start|end))?)?$|^(gap|row-gap|column-gap)$/;
const NAMED =
  'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'.split(
    ' ',
  );
const COLOR_FN = /\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i;

function lengths(T) {
  const out = {};
  for (const k of ['spacing', 'radius', 'size', 'border']) for (const t of T[k].tokens) out[cssVar(t.name)] = parseFloat(t.value);
  return out;
}

// Evaluates a spacing value made of px literals, var(--token) and calc(); returns the list of resulting lengths.
function evaluate(value, vars) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const ch of `${value} `) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ' ' && depth === 0) {
      if (cur) parts.push(cur);
      cur = '';
    } else cur += ch;
  }
  return parts.map((p) => {
    if (p === '0' || p === 'auto') return { text: p, value: 0 };
    const expr = p
      .replace(/^calc\(/, '(')
      .replace(/var\((--[\w-]+)\)/g, (_, n) => (n in vars ? String(vars[n]) : 'NaN'))
      .replace(/(-?\d*\.?\d+)px/g, '$1');
    if (!/^[\d\s.+\-*/()NaN]+$/.test(expr)) return { text: p, value: NaN };
    return { text: p, value: Function(`return (${expr})`)(), seam: p.includes('--fa-space-row-seam') };
  });
}

export default async function rules() {
  const T = tokensJson();
  const vars = lengths(T);
  const problems = [];
  const seen = { sizes: new Set(), weights: new Set(), spacing: 0, mono: [], rowSpecs: 0, vars: new Set() };
  const exceptionsHit = new Set();

  for (const t of T.spacing.tokens) {
    const v = parseFloat(t.value);
    if (v % 4 !== 0 && t.name !== 'space-row-seam') problems.push(`tokens: ${t.name} ${t.value} is not a multiple of 4`);
  }
  for (const t of T.size.tokens) if (parseFloat(t.value) % 4 !== 0) problems.push(`tokens: ${t.name} ${t.value} is not a multiple of 4`);
  for (const g of T.type.groups) {
    for (const s of g.styles) {
      if (!FONT_SIZES.includes(parseFloat(s.fontSize))) problems.push(`tokens: ${s.name} font size ${s.fontSize}`);
      if ((s.fontWeight || 400) > MAX_WEIGHT) problems.push(`tokens: ${s.name} font weight ${s.fontWeight}`);
    }
  }

  for (const file of styleFiles()) {
    const root = postcss.parse(fs.readFileSync(path.join(stylesDir, file), 'utf8'), { from: file });
    root.walkDecls((d) => {
      if (d.parent.type !== 'rule') return;
      const where = `${file}: ${d.parent.selector} { ${d.prop}: ${d.value} }`;
      const value = d.value.trim();
      const prop = d.prop.toLowerCase();

      // Declared or referenced, a custom property carries the library prefix, so it cannot meet a host's --accent or --ring.
      for (const name of [d.prop, ...[...value.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1])]) {
        if (!name.startsWith('--')) continue;
        seen.vars.add(name);
        if (!name.startsWith(`--${PREFIX}`)) problems.push(`custom property ${name} lacks the --${PREFIX} prefix: ${where}`);
      }
      if (prop === 'font' || prop === 'font-size') {
        const m = prop === 'font' ? value.match(/(\d+)px\/\d+px/) : value.match(/^(\d+)px$/);
        if (m) {
          seen.sizes.add(Number(m[1]));
          if (!FONT_SIZES.includes(Number(m[1]))) problems.push(`font size ${m[1]}px is not one of ${FONT_SIZES.join('/')}: ${where}`);
        } else if (!/^(inherit|initial|unset)$/.test(value)) problems.push(`font size not readable: ${where}`);
      }
      if (prop === 'font' || prop === 'font-weight') {
        const m = prop === 'font' ? value.match(/^(?:italic\s+)?(\d{3})\s/) : value.match(/^(\d{3})$/);
        const w = m ? Number(m[1]) : /bold|bolder/.test(value) ? 700 : null;
        if (w !== null) {
          seen.weights.add(w);
          if (w > MAX_WEIGHT) problems.push(`font weight ${w} (600 and above are not used): ${where}`);
        }
      }
      if (SPACING_PROPS.test(prop)) {
        for (const part of evaluate(value, vars)) {
          seen.spacing++;
          if (Number.isNaN(part.value)) problems.push(`spacing value not readable: ${where}`);
          else if (Math.abs(part.value) % 4 !== 0 && !part.seam) {
            const ex = SPACING_EXCEPTIONS.find(([s, p, v]) => s === d.parent.selector && p === prop && v === part.text);
            if (ex) exceptionsHit.add(ex.join(' '));
            else problems.push(`spacing ${part.text} = ${part.value}px is not a multiple of 4: ${where}`);
          }
        }
      }
      for (const [sel, p, v] of ROW_SPECS) {
        if (d.parent.selector === sel && prop === p) {
          seen.rowSpecs++;
          if (value !== v) problems.push(`row height must be ${v}: ${where}`);
        }
      }
      if (value.includes('--fa-row-table') && !splitList(d.parent.selector).every((x) => x.startsWith('.fa-table')))
        problems.push(`--fa-row-table outside a table: ${where}`);
      if (/^animation(-iteration-count)?$/.test(prop) && /\binfinite\b/.test(value) && !LOOP_ALLOWED.includes(d.parent.selector))
        problems.push(`looping animation (only ${LOOP_ALLOWED.join(', ')} may loop): ${where}`);
      if (prop !== 'white-space') {
        const words = value.toLowerCase().split(/[^a-z-]+/);
        if (/#[0-9a-f]{3,8}\b/i.test(value) || COLOR_FN.test(value) || words.some((w) => NAMED.includes(w)))
          problems.push(`literal colour (use a role variable): ${where}`);
      }
      if ((prop === 'font' || prop === 'font-family') && value.includes('--fa-font-mono')) {
        for (const sel of splitList(d.parent.selector)) {
          seen.mono.push(sel);
          if (!MONO_ALLOWED.includes(sel)) problems.push(`monospace outside a code class: ${where}`);
        }
      }
    });
  }

  if (seen.rowSpecs < ROW_SPECS.length) problems.push(`row specs: only ${seen.rowSpecs} of ${ROW_SPECS.length} found in styles/`);
  const lines = [
    `font sizes used: ${[...seen.sizes].sort((a, b) => a - b).join(', ')}px; weights used: ${[...seen.weights].sort().join(', ')}`,
    `${seen.spacing} spacing values checked; known exceptions still present: ${exceptionsHit.size}/${SPACING_EXCEPTIONS.length}`,
    `monospace on: ${seen.mono.join(', ')}`,
    'colours: every colour in styles/ is a var() reference',
    `names: ${seen.vars.size} custom properties declared or referenced in styles/, all --${PREFIX}*`,
    `looping animations only on: ${LOOP_ALLOWED.join(', ')}`,
    `row specs: ${seen.rowSpecs}/${ROW_SPECS.length} found (table row = var(--fa-row-table), 40)`,
  ];
  if (problems.length) lines.push(`${problems.length} problem(s):`, ...problems.map((p) => `  ${p}`));
  return { ok: problems.length === 0, lines };
}
