import { flatten, ratio } from '../lib/color.mjs';
import { loadSource, projectIds, resolveTheme, tokensJson } from '../lib/tokens.mjs';

const TEXT = 4.5;
const MARK = 3;

// Every text role on every surface it can sit on, including the neutral selected and hover washes over each surface.
export function pairs(v) {
  const on = (w, s) => flatten(v[w], v[s]);
  const surfaces = ['bg', 'panel', 'overlay'];
  const grounds = [
    ...surfaces.map((s) => [s, v[s]]),
    ...['selected', 'hover'].flatMap((w) => surfaces.map((s) => [`${w}/${s}`, on(w, s)])),
  ];
  const out = [];
  for (const [g, color] of grounds) {
    out.push([`fg on ${g}`, v.fg, color, TEXT]);
    out.push([`fg-muted on ${g}`, v['fg-muted'], color, TEXT]);
  }
  for (const s of surfaces) {
    out.push([`accent (link) on ${s}`, v.accent, v[s], TEXT]);
    out.push([`danger on ${s}`, v.danger, v[s], TEXT]);
    out.push([`up on ${s}`, v.up, v[s], TEXT]);
    out.push([`down on ${s}`, v.down, v[s], TEXT]);
  }
  for (const w of ['selected/bg', 'selected/panel', 'selected/overlay', 'hover/overlay']) {
    out.push([`danger on ${w}`, v.danger, grounds.find(([g]) => g === w)[1], TEXT]);
  }
  out.push(['on-accent on accent', v['on-accent'], v.accent, TEXT]);
  out.push(['on-danger on danger', v['on-danger'], v.danger, TEXT]);
  for (const s of ['bg', 'panel']) out.push([`focus-ring on ${s}`, v['focus-ring'], v[s], MARK]);
  for (const k of ['success', 'warning', 'info']) for (const s of surfaces) out.push([`${k} mark on ${s}`, v[k], v[s], MARK]);
  for (let i = 1; i <= 6; i++) for (const s of surfaces) out.push([`data-${i} on ${s}`, v[`data-${i}`], v[s], MARK]);
  return out;
}

export default async function contrast() {
  const T = tokensJson();
  const kinds = Object.fromEntries(loadSource().meta.themes.map((t) => [t.id, t.kind]));
  const lines = [];
  let ok = true;
  let total = 0;
  for (const { id } of T.color.themes) {
    const row = [];
    for (const project of projectIds(T)) {
      const v = resolveTheme(T, id, project);
      const results = pairs(v).map(([name, f, b, min]) => ({ name, r: ratio(f, b), min }));
      total += results.length;
      const bad = results.filter((x) => x.r < x.min);
      const minText = Math.min(...results.filter((x) => x.min === TEXT).map((x) => x.r));
      const minMark = Math.min(...results.filter((x) => x.min === MARK).map((x) => x.r));
      row.push(`${project} text ${minText.toFixed(2)} marks ${minMark.toFixed(2)}`);
      for (const b of bad) {
        ok = false;
        lines.push(`  FAIL ${id}/${project}: ${b.name} ${b.r.toFixed(2)} < ${b.min}`);
      }
    }
    lines.push(`${id.padEnd(11)} (${kinds[id]})  ${row.join(' | ')}`);
  }
  lines.unshift(`${total} pairs: text and links >= ${TEXT}, marks and data colours >= ${MARK}; lowest ratio per theme and brand:`);
  return { ok, lines };
}
