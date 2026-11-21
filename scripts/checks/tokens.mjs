import fs from 'node:fs';
import path from 'node:path';
import { renderCss, renderJson, root, tokensJson } from '../lib/tokens.mjs';

const fixture = (f) => fs.readFileSync(path.join(root, 'test', 'fixtures', f), 'utf8');

function diffValues(a, b, at = '', out = []) {
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    if (a !== b) out.push(`${at}: baseline ${JSON.stringify(b)} / generated ${JSON.stringify(a)}`);
    return out;
  }
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) diffValues(a[k], b[k], `${at}.${k}`, out);
  return out;
}

const cssVars = (css) => {
  const out = [];
  for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    for (const d of m[2].split(';').filter(Boolean)) out.push(`${m[1].trim()} ${d.trim()}`);
  }
  return out;
};

export default async function tokens() {
  const T = tokensJson();
  const lines = [];
  let ok = true;

  const json = renderJson(T);
  const baseJson = fixture('tokens.json');
  const jsonDiff = diffValues(T, JSON.parse(baseJson));
  if (json === baseJson)
    lines.push(`tokens.json: byte-identical to baseline (${T.color.tokens.length} colour tokens x ${T.color.themes.length} themes)`);
  else {
    ok = false;
    lines.push(`tokens.json differs from baseline: ${jsonDiff.length} value(s)`, ...jsonDiff.slice(0, 20));
    if (!jsonDiff.length) lines.push('  (values equal; formatting differs)');
  }

  const css = renderCss(T);
  const baseCss = fixture('tokens.css');
  if (css === baseCss) lines.push(`tokens.css: byte-identical to baseline (${cssVars(css).length} declarations)`);
  else {
    ok = false;
    const a = new Set(cssVars(css));
    const b = new Set(cssVars(baseCss));
    lines.push('tokens.css differs from baseline');
    for (const d of [...b].filter((x) => !a.has(x)).slice(0, 10)) lines.push(`  missing: ${d}`);
    for (const d of [...a].filter((x) => !b.has(x)).slice(0, 10)) lines.push(`  extra:   ${d}`);
  }
  return { ok, lines };
}
