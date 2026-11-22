import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, 'tokens', f), 'utf8'));

export function loadSource() {
  return {
    meta: read('themes.json'),
    palette: read('palette.json').tokens,
    brand: read('brand.json').tokens,
    projects: read('brand.json').projects,
    semantic: read('semantic.json'),
    data: read('data.json').tokens,
    type: read('type.json'),
    scales: read('scales.json'),
  };
}

export function tokensJson(src = loadSource()) {
  const { meta, palette, brand, projects, semantic, data, type, scales } = src;
  return {
    name: meta.name,
    version: meta.version,
    color: {
      themes: meta.themes.map(({ id, name }) => ({ id, name })),
      tokens: [...palette, ...brand, ...semantic.roles, ...semantic.market, ...data],
      projects,
    },
    type,
    spacing: scales.spacing,
    radius: scales.radius,
    shadow: scales.shadow,
    size: scales.size,
    border: scales.border,
    duration: scales.duration,
    easing: scales.easing,
  };
}

export const renderJson = (T) => JSON.stringify(T, null, 1);

// Every custom property and type class this library emits carries this prefix, so it can sit beside another design
// system's variables (--accent, --border, --radius-md) without colliding. Token names in tokens.json carry none.
export const PREFIX = 'fa-';
export const cssVar = (name) => `--${PREFIX}${name}`;

const ref = (v) => (/^\{/.test(v) ? `var(${cssVar(v.slice(1, -1))})` : v);

export function renderCss(T) {
  const ids = T.color.themes.map((t) => t.id);
  const block = (id) =>
    T.color.tokens.map((t) => `${cssVar(t.name)}:${ref(t.value[id])};`).join('') +
    T.shadow.tokens.map((t) => `${cssVar(t.name)}:${t.value[id]};`).join('');
  let css = `:root,[data-theme="${ids[0]}"]{${block(ids[0])}}\n`;
  for (const id of ids.slice(1)) css += `[data-theme="${id}"]{${block(id)}}\n`;
  // Project (brand) layer after the theme blocks: same specificity, so it wins when both attributes sit on one element.
  for (const p of T.color.projects) {
    const set = Object.entries(p.set);
    if (set.length) css += `[data-project="${p.id}"]{${set.map(([k, v]) => `${cssVar(k)}:${ref(v)};`).join('')}}\n`;
  }
  const scales = ['spacing', 'radius', 'size', 'border', 'duration', 'easing'];
  const families = ['sans', 'mono'].map((k) => `${cssVar(`font-${k}`)}:${T.type.families[k]};`);
  css += `:root{${scales.flatMap((k) => T[k].tokens.map((t) => `${cssVar(t.name)}:${t.value};`)).join('')}${families.join('')}}\n`;
  // Reduced motion lives with the duration tokens, so it holds for any page that loads them, with or without a reset.
  const still = T.duration.tokens.map((t) => `${cssVar(t.name)}:${T.duration.reducedMotion};`).join('');
  css += `@media (prefers-reduced-motion:reduce){:root{${still}}}\n`;
  css += `${T.type.groups
    .flatMap((g) =>
      g.styles.map(
        (s) => `.${PREFIX}${s.name}{font:${s.fontWeight || 400} ${s.fontSize}/${s.lineHeight} var(${cssVar(`font-${g.family}`)});}`,
      ),
    )
    .join('\n')}\n`;
  return `/* ${T.name} — generated from tokens.json */\n${css}`;
}

// Resolved colour values for one theme and one project (brand), following aliases and the project layer.
// The project layer comes from tokens/brand.json, the same data that writes the [data-project] rules in tokens.css.
export const projectIds = (T) => T.color.projects.map((p) => p.id);

export function resolveTheme(T, themeId, project = 'fleet') {
  const raw = Object.fromEntries(T.color.tokens.map((t) => [t.name, t.value[themeId]]));
  const layer = T.color.projects.find((p) => p.id === project);
  if (!layer) throw new Error(`unknown project ${project}`);
  Object.assign(raw, layer.set);
  const out = {};
  const get = (name, seen = new Set()) => {
    if (name in out) return out[name];
    if (seen.has(name)) throw new Error(`alias loop at ${name}`);
    seen.add(name);
    const v = raw[name];
    if (v === undefined) throw new Error(`unknown token ${name} in ${themeId}`);
    out[name] = /^\{/.test(v) ? get(v.slice(1, -1), seen) : v;
    return out[name];
  };
  for (const name of Object.keys(raw)) get(name);
  return out;
}
