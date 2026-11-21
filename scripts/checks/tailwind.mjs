import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { compile } from 'tailwindcss';
import { cssVar, renderCss, root, tokensJson } from '../lib/tokens.mjs';

const require = createRequire(import.meta.url);
const twDir = path.dirname(require.resolve('tailwindcss/package.json'));

// Utility -> declaration it must produce. Colours, spacing and sizes go through the role variables.
const EXPECT = {
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
// Utilities that must not exist: off-scale sizes and weights, Tailwind's default palette.
const ABSENT = ['font-semibold', 'font-bold', 'text-2xl', 'text-red-500', 'bg-white', 'rounded-xl'];

export default async function tailwind() {
  const T = tokensJson();
  const lines = [];
  const problems = [];
  const input = '@import "tailwindcss/theme.css" layer(theme);\n@import "./tailwind/theme.css";\n@tailwind utilities;\n';
  const compiler = await compile(input, {
    base: root,
    loadStylesheet: async (id, base) => {
      const file = id.startsWith('tailwindcss/') ? path.join(twDir, id.slice('tailwindcss/'.length)) : path.resolve(base, id);
      return { path: file, base: path.dirname(file), content: fs.readFileSync(file, 'utf8') };
    },
  });
  const utilities = [
    ...Object.keys(EXPECT),
    ...ABSENT,
    'text-xs',
    'text-sm',
    'text-base',
    'text-lg',
    'text-xl',
    'rounded-sm',
    'rounded-md',
    'rounded-lg',
    'rounded-full',
  ];
  const css = compiler.build(utilities);
  const ruleFor = (u) => {
    const m = css.match(new RegExp(`\\.${u.replace(/[-[\]]/g, '\\$&')}\\s*\\{([^}]*)\\}`));
    return m ? m[1].replace(/\s+/g, ' ').trim() : null;
  };
  for (const [u, want] of Object.entries(EXPECT)) {
    const got = ruleFor(u);
    if (!got?.includes(want)) problems.push(`${u}: expected "${want}", got ${got === null ? 'no rule' : `"${got}"`}`);
  }
  for (const u of ABSENT) if (ruleFor(u) !== null) problems.push(`${u} should not exist`);

  // Font sizes and line heights are literal in the theme (the type scale has classes, not variables); they must equal
  // the tokens. Everything else is a reference, and every reference must name a variable that tokens.css declares.
  const theme = fs.readFileSync(path.join(root, 'tailwind', 'theme.css'), 'utf8');
  const declared = new Set([...renderCss(T).matchAll(/(--[\w-]+):/g)].map((m) => m[1]));
  const tv = (name) => (theme.match(new RegExp(`--${name}:\\s*([^;]+);`)) || [])[1]?.trim();
  const style = (n) => T.type.groups.flatMap((g) => g.styles).find((s) => s.name === n);
  const pairs = [
    ['text-xs', style('caption')],
    ['text-sm', style('control')],
    ['text-base', style('body')],
    ['text-lg', style('title')],
    ['text-xl', style('heading')],
  ];
  for (const [k, s] of pairs) {
    if (tv(k) !== s.fontSize || tv(`${k}--line-height`) !== s.lineHeight)
      problems.push(`${k} is ${tv(k)}/${tv(`${k}--line-height`)}, token ${s.name} is ${s.fontSize}/${s.lineHeight}`);
  }
  for (const r of T.radius.tokens)
    if (tv(r.name) !== `var(${cssVar(r.name)})`) problems.push(`${r.name} is ${tv(r.name)} in the theme, not var(${cssVar(r.name)})`);
  const mapped = new Set([...theme.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]));
  for (const v of mapped) if (!declared.has(v)) problems.push(`the theme refers to ${v}, which tokens.css does not declare`);
  const roles = T.color.tokens.filter((t) => !/^(palette|brand)-/.test(t.name)).map((t) => t.name);
  const unmapped = roles.filter((r) => !mapped.has(cssVar(r)));

  lines.push(`${Object.keys(EXPECT).length} utilities resolve to the variables; ${ABSENT.length} off-scale utilities are absent`);
  lines.push(`type scale and radii match tokens; colour roles without a utility: ${unmapped.join(', ') || 'none'}`);
  if (problems.length) lines.push(...problems.map((p) => `  ${p}`));
  return { ok: problems.length === 0, lines };
}
