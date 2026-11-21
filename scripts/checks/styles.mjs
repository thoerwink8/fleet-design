import fs from 'node:fs';
import path from 'node:path';
import { atoms, cmp, entries, relation, selectorSpecificity, splitList, touches } from '../lib/css.mjs';
import { concatStyles, styleFiles, stylesDir } from '../lib/styles.mjs';
import { root } from '../lib/tokens.mjs';

// Classes that the previews put on the same element (e.g. "fa-pop fa-cmd"), read from markup and scripts.
function coOccurring() {
  const pairs = new Set();
  const dirs = ['previews/cards', 'previews/lib'].map((d) => path.join(root, d)).filter((d) => fs.existsSync(d));
  for (const dir of dirs) {
    for (const f of fs.readdirSync(dir)) {
      const text = fs.readFileSync(path.join(dir, f), 'utf8');
      for (const m of text.matchAll(/class(?:Name)?\s*=\s*\\?["'`]([^"'`]+)/g)) {
        const blocks = [...new Set(m[1].split(/\s+/).filter((c) => /^[a-z][\w-]*$/i.test(c)))];
        for (const a of blocks) for (const b of blocks) if (a !== b) pairs.add(`${a} ${b}`);
      }
    }
  }
  return pairs;
}

const show = (e) => `${e.context.length ? `${e.context.join(' ')} ` : ''}${e.selector}`;

// A swap is settled when a third, unconditional rule with one of the two exact selectors sets every shared
// property and comes after both rules in both orders: that rule wins either way.
function settledLater(base, newIndex, i, j, sels, props) {
  const need = new Set(props.flatMap(atoms));
  for (let r = j + 1; r < base.length; r++) {
    const R = base[r];
    if (R.kind !== 'rule' || R.context.length || newIndex[r] < newIndex[i] || newIndex[r] < newIndex[j]) continue;
    if (!splitList(R.selector).some((s) => sels.includes(s))) continue;
    const have = new Set(R.decls.flatMap(([p]) => atoms(p)));
    if ([...need].every((x) => have.has(x))) return true;
  }
  return false;
}

// A swap is also harmless when, for every shared property, the unconditional rules with one of the two exact
// selectors end on the same declaration in the baseline order and in the new order (for example two rules that
// both state the same value, so either order gives the same result).
function sameOutcome(base, newIndex, i, j, sels, props) {
  if (base[i].context.length || base[j].context.length) return false;
  const rules = [];
  base.forEach((R, r) => {
    if (R.kind === 'rule' && !R.context.length && splitList(R.selector).some((s) => sels.includes(s))) rules.push(r);
  });
  const winner = (atom, order) => {
    let best = null;
    for (const r of [...rules].sort((x, y) => order(x) - order(y))) {
      for (const [p, v, imp] of base[r].decls) {
        if (!atoms(p).includes(atom)) continue;
        if (best && best.imp && !imp) continue;
        best = { decl: `${p}:${v}`, imp };
      }
    }
    return best ? `${best.decl}${best.imp ? '!important' : ''}` : '';
  };
  return props.flatMap(atoms).every((atom) => winner(atom, (r) => r) === winner(atom, (r) => newIndex[r]));
}

// Pairs of rules whose relative order differs from the baseline, and whether that can change the cascade.
export function orderReport(base, next, together) {
  const pos = new Map();
  const used = new Map();
  base.forEach((e, i) => {
    if (!pos.has(e.key)) pos.set(e.key, []);
    pos.get(e.key).push(i);
  });
  const newIndex = new Array(base.length);
  next.forEach((e, j) => {
    const k = used.get(e.key) || 0;
    used.set(e.key, k + 1);
    newIndex[pos.get(e.key)[k]] = j;
  });
  const conflicts = [];
  const assumed = [];
  let inverted = 0;
  for (let i = 0; i < base.length; i++) {
    for (let j = i + 1; j < base.length; j++) {
      if (newIndex[i] < newIndex[j]) continue;
      inverted++;
      const a = base[i];
      const b = base[j];
      if (a.kind !== 'rule' || b.kind !== 'rule') continue;
      const props = touches(a, b);
      if (!props.length) continue;
      for (const sa of splitList(a.selector)) {
        for (const sb of splitList(b.selector)) {
          if (cmp(selectorSpecificity(sa), selectorSpecificity(sb)) !== 0) continue;
          const rel = relation(sa, sb, together);
          if (rel === 'disjoint') continue;
          if (rel === 'same' && settledLater(base, newIndex, i, j, [sa, sb], props)) continue;
          if (rel === 'same' && sameOutcome(base, newIndex, i, j, [sa, sb], props)) continue;
          const item = { earlier: show(a), later: show(b), sa, sb, props, lineA: a.line, lineB: b.line };
          (rel === 'same' ? conflicts : assumed).push(item);
        }
      }
    }
  }
  return { inverted, conflicts, assumed };
}

export default async function styles() {
  const lines = [];
  let ok = true;
  const baseline = fs.readFileSync(path.join(root, 'test', 'fixtures', 'bundle.css'), 'utf8');
  const base = entries(baseline, 'bundle.css');
  const next = entries(concatStyles(), 'styles.css');

  const count = (list) => list.reduce((m, e) => m.set(e.key, (m.get(e.key) || 0) + 1), new Map());
  const cb = count(base);
  const cn = count(next);
  const missing = [...cb].filter(([k, n]) => (cn.get(k) || 0) < n).map(([k]) => k);
  const extra = [...cn].filter(([k, n]) => (cb.get(k) || 0) < n).map(([k]) => k);
  lines.push(
    `${styleFiles().length} files in ${path.relative(root, stylesDir)}/, ${next.length} rules; baseline bundle.css ${base.length} rules`,
  );
  if (missing.length || extra.length) {
    ok = false;
    lines.push(`rule sets differ: ${missing.length} missing, ${extra.length} extra`);
    for (const k of missing.slice(0, 10)) lines.push(`  missing ${k}`);
    for (const k of extra.slice(0, 10)) lines.push(`  extra   ${k}`);
    return { ok, lines };
  }
  lines.push('same rules: every selector, condition and declaration list matches the baseline (comments ignored)');

  const pairs = coOccurring();
  const together = (x, y) => pairs.has(`${x} ${y}`);
  lines.push(`${pairs.size / 2} pairs of classes appear together on one element in the previews; swaps between them count as same-subject`);
  const { inverted, conflicts, assumed } = orderReport(base, next, together);
  lines.push(`order: ${inverted} rule pairs swapped relative to the baseline`);
  if (conflicts.length) {
    ok = false;
    lines.push(`${conflicts.length} swapped pair(s) can change the cascade (same subject, same specificity, shared property):`);
    for (const c of conflicts) lines.push(`  ${c.sa}  <->  ${c.sb}  [${c.props.join(', ')}]`);
  } else lines.push('  0 swapped pairs share a subject, a specificity and a property, so none can change the cascade');
  lines.push(
    `  ${assumed.length} swapped pair(s) share a property and specificity but style different components; the computed-style comparison in the browser check covers them`,
  );
  if (process.env.STYLES_VERBOSE) for (const c of assumed) lines.push(`    ${c.sa}  <->  ${c.sb}  [${c.props.join(', ')}]`);
  return { ok, lines };
}
