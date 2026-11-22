import fs from 'node:fs';
import path from 'node:path';
import { compileTailwind, ruleFor } from '../lib/tailwind.mjs';
import { cssVar, renderCss, root, tokensJson } from '../lib/tokens.mjs';

// tailwind/theme.css replaces Tailwind's scale. Utility -> declaration it must produce.
const REPLACE = {
  'bg-panel': 'background-color: var(--fa-panel)',
  'text-fg-muted': 'color: var(--fa-fg-muted)',
  'border-border': 'border-color: var(--fa-border)',
  'bg-accent': 'background-color: var(--fa-accent)',
  'text-up': 'color: var(--fa-up)',
  'bg-data-1': 'background-color: var(--fa-data-1)',
  'outline-ring': 'outline-color: var(--fa-focus-ring)',
  'px-row-x': 'padding-inline: var(--fa-space-row-x)',
  'h-ctrl': 'height: var(--fa-ctrl)',
  'h-row-2': 'height: var(--fa-row-2)',
  'p-3': 'padding: calc(4px * 3)',
  'font-sans': 'font-family: var(--fa-font-sans)',
  'font-mono': 'font-family: var(--fa-font-mono)',
  'font-medium': 'font-weight: 500',
  'shadow-overlay': 'var(--fa-shadow-overlay)',
  'rounded-md': 'border-radius: var(--fa-radius-md)',
};
// Utilities that must not exist with theme.css: off-scale sizes and weights, Tailwind's default palette.
const ABSENT = ['font-semibold', 'font-bold', 'text-2xl', 'text-red-500', 'bg-white', 'rounded-xl'];

// tailwind/extend.css adds the same variables under fa- names to a project that keeps its own theme.
const EXTEND = {
  'bg-fa-panel': 'background-color: var(--fa-panel)',
  'text-fa-fg-muted': 'color: var(--fa-fg-muted)',
  'border-fa-border': 'border-color: var(--fa-border)',
  'bg-fa-accent': 'background-color: var(--fa-accent)',
  'text-fa-up': 'color: var(--fa-up)',
  'bg-fa-data-1': 'background-color: var(--fa-data-1)',
  'outline-fa-ring': 'outline-color: var(--fa-focus-ring)',
  'px-fa-row-x': 'padding-inline: var(--fa-space-row-x)',
  'h-fa-ctrl': 'height: var(--fa-ctrl)',
  'h-fa-row-2': 'height: var(--fa-row-2)',
  'rounded-fa-md': 'border-radius: var(--fa-radius-md)',
  'font-fa-sans': 'font-family: var(--fa-font-sans)',
  'font-fa-mono': 'font-family: var(--fa-font-mono)',
  'text-fa-body': 'font-size: 15px',
  'shadow-fa-overlay': 'var(--fa-shadow-overlay)',
  'ease-fa-out': 'var(--fa-ease-out)',
};
// Tailwind's own utilities, which must come out of a build with extend.css exactly as they do without it.
const KEPT = [
  ...ABSENT,
  'rounded-md',
  'font-sans',
  'font-mono',
  'font-medium',
  'text-sm',
  'shadow-md',
  'ease-out',
  'p-3',
  'border-red-500',
];
// Namespaces extend.css may add keys to, always as --<namespace>-fa-<name>.
const EXTEND_KEY = /^--(color|spacing|radius|font|text|shadow|ease)-fa-[\w-]+$/;

const TYPE_STEPS = ['caption', 'control', 'body', 'title', 'heading'];
const DEFAULTS = '@import "tailwindcss/theme.css" layer(theme);\n';

export default async function tailwind() {
  const T = tokensJson();
  const lines = [];
  const problems = [];
  const declared = new Set([...renderCss(T).matchAll(/(--[\w-]+):/g)].map((m) => m[1]));
  const style = (n) => T.type.groups.flatMap((g) => g.styles).find((s) => s.name === n);
  const read = (f) => fs.readFileSync(path.join(root, 'tailwind', f), 'utf8');
  const keys = (css) => new Map([...css.matchAll(/^\s*(--[\w*-]+):\s*([^;]+);/gm)].map((m) => [m[1], m[2].trim()]));
  const refs = (css) => new Set([...css.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]));
  const expect = (css, table, file) => {
    for (const [u, want] of Object.entries(table)) {
      const got = ruleFor(css, u);
      if (!got?.includes(want)) problems.push(`${file}: ${u}: expected "${want}", got ${got === null ? 'no rule' : `"${got}"`}`);
    }
  };
  // Font sizes and line heights are literal in both files (the type scale has classes, not variables); they must equal
  // the tokens. Everything else is a reference, and every reference must name a variable that tokens.css declares.
  const audit = (file, css, sizeKey) => {
    const k = keys(css);
    for (const [i, step] of TYPE_STEPS.entries()) {
      const s = style(step);
      const key = sizeKey(step, i);
      if (k.get(key) !== s.fontSize || k.get(`${key}--line-height`) !== s.lineHeight)
        problems.push(`${file}: ${key} is ${k.get(key)}/${k.get(`${key}--line-height`)}, token ${s.name} is ${s.fontSize}/${s.lineHeight}`);
    }
    for (const v of refs(css)) if (!declared.has(v)) problems.push(`${file} refers to ${v}, which tokens.css does not declare`);
    return k;
  };

  const theme = read('theme.css');
  const themeKeys = audit('theme.css', theme, (_, i) => `--text-${['xs', 'sm', 'base', 'lg', 'xl'][i]}`);
  for (const r of T.radius.tokens)
    if (themeKeys.get(`--${r.name}`) !== `var(${cssVar(r.name)})`) problems.push(`theme.css: --${r.name} is not var(${cssVar(r.name)})`);
  const replaced = await compileTailwind(`${DEFAULTS}@import "@fleet/design/tailwind";\n@tailwind utilities;\n`, [
    ...Object.keys(REPLACE),
    ...ABSENT,
  ]);
  expect(replaced, REPLACE, 'theme.css');
  for (const u of ABSENT) if (ruleFor(replaced, u) !== null) problems.push(`theme.css: ${u} should not exist`);
  const roles = T.color.tokens.filter((t) => !/^(palette|brand)-/.test(t.name)).map((t) => t.name);
  const unmapped = roles.filter((r) => !refs(theme).has(cssVar(r)));
  lines.push(
    `theme.css (replaces the scale): ${Object.keys(REPLACE).length} utilities resolve to the variables; ${ABSENT.length} off-scale utilities are absent`,
  );
  lines.push(`  type scale and radii match tokens; colour roles without a utility: ${unmapped.join(', ') || 'none'}`);

  const extend = read('extend.css');
  const extendKeys = audit('extend.css', extend, (step) => `--text-fa-${step}`);
  const foreign = [...extendKeys.keys()].filter((k) => !EXTEND_KEY.test(k));
  if (foreign.length) problems.push(`extend.css sets keys outside the fa- names: ${foreign.join(', ')}`);
  if (/\binitial\b/.test(extend)) problems.push('extend.css must not reset a namespace (initial)');
  const missing = [...refs(theme)].filter((v) => !refs(extend).has(v));
  if (missing.length) problems.push(`extend.css lacks a key for ${missing.join(', ')} (theme.css has one)`);
  const candidates = [...Object.keys(EXTEND), ...KEPT];
  const plain = await compileTailwind(`${DEFAULTS}@tailwind utilities;\n`, candidates);
  const extended = await compileTailwind(`${DEFAULTS}@import "@fleet/design/tailwind/extend";\n@tailwind utilities;\n`, candidates);
  expect(extended, EXTEND, 'extend.css');
  for (const u of KEPT) {
    const [a, b] = [ruleFor(plain, u), ruleFor(extended, u)];
    if (a === null) problems.push(`${u} is not a Tailwind default utility; fix the KEPT list`);
    else if (a !== b) problems.push(`extend.css changes ${u}: "${a}" became ${b === null ? 'no rule' : `"${b}"`}`);
  }
  lines.push(
    `extend.css (adds to a project's theme): ${extendKeys.size} keys, all --<namespace>-fa-*, none resets a namespace; ${Object.keys(EXTEND).length} fa- utilities resolve to the variables`,
  );
  lines.push(
    `  ${KEPT.length} Tailwind default utilities compile to the same declarations with and without it; every variable theme.css maps has a key`,
  );

  if (problems.length) lines.push(...problems.map((p) => `  ${p}`));
  return { ok: problems.length === 0, lines };
}
