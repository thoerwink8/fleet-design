import { browserSession } from '../lib/browser.mjs';
import { compileTailwind } from '../lib/tailwind.mjs';
import { resolveTheme, tokensJson } from '../lib/tokens.mjs';

// A project with its own Tailwind theme, in the common shape: preflight, role variables on :root that share names with
// ours (--accent is a neutral fill here), theme keys of its own for radius, font and easing. The fleet lines are what
// the README tells such a project to add.
const HOST_VARS = { '--accent': '#f4f4f5', '--border': '#e4e4e7', '--ring': '#a1a1aa', '--success': '#16a34a', '--hover': '#fafafa' };
const HOST_THEME = { '--radius-md': '6px', '--font-sans': '"Host Sans", sans-serif', '--ease-out': 'cubic-bezier(0, 0, 0.2, 1)' };
const decls = (o) =>
  Object.entries(o)
    .map(([k, v]) => `${k}: ${v};`)
    .join(' ');
const hostCss = (withFleet) => `@layer fleet-tokens, theme, base, fleet, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css" layer(utilities);
${
  withFleet
    ? `@import "@fleet/design/tokens.css" layer(fleet-tokens);
@import "@fleet/design/styles.css" layer(fleet);
@import "@fleet/design/tailwind/extend";
`
    : ''
}@theme { ${decls(HOST_THEME)} }
@theme inline { --color-accent: var(--accent); --color-border: var(--border); --color-ring: var(--ring); --color-success: var(--success); }
:root { ${decls(HOST_VARS)} }
@layer base { body { background: #ffffff; color: #18181b; } button:focus-visible { outline: 3px dotted var(--ring); } }
`;
const CLASSES =
  'bg-accent border border-border rounded-md font-sans ease-out transition-colors p-3 text-sm text-success text-red-500 bg-fa-accent rounded-fa-md h-fa-ctrl text-fa-body font-fa-sans';
const BODY = `<main id="host" class="bg-accent border border-border rounded-md font-sans ease-out transition-colors p-3 text-sm">
<button id="host-button">host</button><input id="host-input" value="host"><a id="host-link" class="text-red-500" href="#">host</a>
<h1 id="host-h1" class="text-success">host</h1><div id="host-hidden" hidden>host</div></main>
<div style="position:absolute;top:300px;left:0"><button id="fa-button" class="fa-btn fa-btn--primary">fleet</button>
<div id="fa-util" class="bg-fa-accent rounded-fa-md h-fa-ctrl text-fa-body font-fa-sans"></div></div>`;
const page = (css) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${css}</style></head><body>${BODY}</body></html>`;

// Everything the host owns: its variables on the root, and every computed property of its page and its elements.
function hostState(names) {
  const root = getComputedStyle(document.documentElement);
  const vars = Object.fromEntries(names.map((n) => [n, root.getPropertyValue(n).trim()]));
  const styles = {};
  for (const e of [document.documentElement, document.body, ...document.querySelectorAll('#host, #host *')]) {
    const cs = getComputedStyle(e);
    const out = {};
    for (const p of cs) if (!p.startsWith('--')) out[p] = cs.getPropertyValue(p);
    styles[e.id || e.tagName.toLowerCase()] = out;
  }
  return { vars, styles };
}
function pick([selector, props]) {
  const cs = getComputedStyle(document.querySelector(selector));
  return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p).trim()]));
}
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
const OUTLINE = ['outline-style', 'outline-width', 'outline-color', 'outline-offset'];

export default async function coexist() {
  const T = tokensJson();
  const light = resolveTheme(T, 'light');
  const dark = resolveTheme(T, 'dark');
  const px = (group, name) => T[group].tokens.find((t) => t.name === name).value;
  const { browser } = await browserSession();
  const context = await browser.newContext({ viewport: { width: 1000, height: 700 }, deviceScaleFactor: 1 });
  const problems = [];
  const lines = [];
  const names = [...Object.keys(HOST_VARS), ...Object.keys(HOST_THEME), '--color-red-500', '--spacing'];
  const candidates = CLASSES.split(' ');

  const open = async (withFleet) => {
    const p = await context.newPage();
    await p.setContent(page(await compileTailwind(hostCss(withFleet), candidates)));
    return p;
  };
  const tabTo = async (p, id) => {
    for (let i = 0; i < 8; i++) {
      await p.keyboard.press('Tab');
      if ((await p.evaluate(() => document.activeElement?.id)) === id) return;
    }
    problems.push(`Tab never reached #${id}`);
  };
  const before = await open(false);
  const after = await open(true);

  // 1. The host's own variables and every computed property of its elements are the same with fleet-design loaded.
  const [a, b] = [await before.evaluate(hostState, names), await after.evaluate(hostState, names)];
  for (const n of names) {
    if (!a.vars[n]) problems.push(`host variable ${n} has no value in the reference page; fix the check`);
    else if (a.vars[n] !== b.vars[n]) problems.push(`host variable ${n}: ${a.vars[n]} became ${b.vars[n]}`);
  }
  let props = 0;
  for (const [id, style] of Object.entries(a.styles)) {
    for (const [p, v] of Object.entries(style)) {
      props++;
      if (b.styles[id][p] !== v) problems.push(`host <${id}> ${p}: ${v} became ${b.styles[id][p]}`);
    }
  }
  lines.push(
    `host: ${names.length} variables (${names.slice(0, 2).join(', ')}, --radius-md, --font-sans, --ease-out, ...) keep their computed values`,
  );
  lines.push(
    `host: ${Object.keys(a.styles).length} elements (html, body, a bare button, input, link, heading), ${props} computed properties, none changed`,
  );
  await tabTo(before, 'host-button');
  await tabTo(after, 'host-button');
  const [fa0, fa1] = [await before.evaluate(pick, ['#host-button', OUTLINE]), await after.evaluate(pick, ['#host-button', OUTLINE])];
  if (JSON.stringify(fa0) !== JSON.stringify(fa1))
    problems.push(`host button focus outline changed: ${JSON.stringify(fa0)} became ${JSON.stringify(fa1)}`);
  lines.push(`host: a focused host button keeps the host's outline (${fa1['outline-width']} ${fa1['outline-style']})`);

  // 2. The fleet variables, utilities and components work beside it.
  const want = (what, got, expected) => {
    if (got !== expected) problems.push(`${what}: expected ${expected}, got ${got || 'nothing'}`);
  };
  const root = (p, n) => p.evaluate((name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(), n);
  want('--fa-accent', await root(after, '--fa-accent'), light.accent);
  want('--fa-accent without fleet-design', await root(before, '--fa-accent'), '');
  const util = await after.evaluate(pick, [
    '#fa-util',
    ['background-color', 'border-top-left-radius', 'height', 'font-size', 'line-height'],
  ]);
  want('bg-fa-accent', util['background-color'], rgb(light.accent));
  want('rounded-fa-md', util['border-top-left-radius'], px('radius', 'radius-md'));
  want('h-fa-ctrl', util.height, px('size', 'ctrl'));
  want('text-fa-body', `${util['font-size']}/${util['line-height']}`, '15px/24px');
  const button = await after.evaluate(pick, ['#fa-button', ['background-color', 'color', 'height']]);
  want('.fa-btn--primary background', button['background-color'], rgb(light.accent));
  want('.fa-btn--primary colour', button.color, rgb(light['on-accent']));
  want('.fa-btn height', button.height, px('size', 'ctrl'));
  await tabTo(after, 'fa-button');
  const ring = await after.evaluate(pick, ['#fa-button', OUTLINE]);
  want('.fa-btn focus ring', OUTLINE.map((p) => ring[p]).join(' '), `solid ${px('border', 'bw-focus')} ${rgb(light['focus-ring'])} 2px`);
  lines.push(`fleet: --fa-accent is ${light.accent}; bg-fa-accent, rounded-fa-md, h-fa-ctrl and text-fa-body compute to the tokens`);
  lines.push(
    `fleet: .fa-btn--primary is ${button.height} high in the accent, with the ${ring['outline-width']} fleet focus ring, under the host's preflight`,
  );

  // 3. data-theme switches the fleet variables and leaves the host's alone.
  await after.evaluate(() => {
    document.documentElement.dataset.theme = 'dark';
  });
  want('--fa-bg in dark', await root(after, '--fa-bg'), dark.bg);
  want('host --accent in dark', await root(after, '--accent'), HOST_VARS['--accent']);
  lines.push(`data-theme="dark": --fa-bg becomes ${dark.bg}, the host's --accent stays ${HOST_VARS['--accent']}`);

  await context.close();
  if (problems.length) lines.push(`${problems.length} problem(s):`, ...problems.slice(0, 30).map((p) => `  ${p}`));
  return { ok: problems.length === 0, lines };
}
