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
    semantic: read('semantic.json'),
    data: read('data.json').tokens,
    type: read('type.json'),
    scales: read('scales.json'),
  };
}

export function tokensJson(src = loadSource()) {
  const { meta, palette, brand, semantic, data, type, scales } = src;
  return {
    name: meta.name,
    version: meta.version,
    color: {
      themes: meta.themes.map(({ id, name }) => ({ id, name })),
      tokens: [...palette, ...brand, ...semantic.roles, ...semantic.market, ...data],
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

const ref = (v) => (/^\{/.test(v) ? `var(--${v.slice(1, -1)})` : v);

export function renderCss(T) {
  const ids = T.color.themes.map((t) => t.id);
  const block = (id) =>
    T.color.tokens.map((t) => `--${t.name}:${ref(t.value[id])};`).join('') +
    T.shadow.tokens.map((t) => `--${t.name}:${t.value[id]};`).join('');
  let css = `:root,[data-theme="${ids[0]}"]{${block(ids[0])}}\n`;
  for (const id of ids.slice(1)) css += `[data-theme="${id}"]{${block(id)}}\n`;
  const scales = ['spacing', 'radius', 'size', 'border', 'duration', 'easing'];
  css += `:root{${scales.flatMap((k) => T[k].tokens.map((t) => `--${t.name}:${t.value};`)).join('')}--font-sans:${T.type.families.sans};--font-mono:${T.type.families.mono};}\n`;
  css += `${T.type.groups
    .flatMap((g) => g.styles.map((s) => `.${s.name}{font:${s.fontWeight || 400} ${s.fontSize}/${s.lineHeight} var(--font-${g.family});}`))
    .join('\n')}\n`;
  return `/* ${T.name} — generated from tokens.json */\n${css}`;
}

// Resolved colour values for one theme and one project (brand), following aliases and the project layer.
// The project layer mirrors styles/base.css: it only re-points accent (and, for ashare, up/down).
export const PROJECTS = {
  fleet: {},
  ashare: { accent: '{brand-ashare}', up: '{palette-red}', down: '{palette-green}' },
  jiqun: { accent: '{brand-jiqun}' },
};

export function resolveTheme(T, themeId, project = 'fleet') {
  const raw = Object.fromEntries(T.color.tokens.map((t) => [t.name, t.value[themeId]]));
  Object.assign(raw, PROJECTS[project]);
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
