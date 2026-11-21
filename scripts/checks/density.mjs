import { browserSession } from '../lib/browser.mjs';
import { tokensJson } from '../lib/tokens.mjs';

// The density table in the README, read from the tokens that define it.
export function densitySpec(T = tokensJson()) {
  const px = (name) => {
    for (const k of ['spacing', 'size']) {
      const t = T[k].tokens.find((x) => x.name === name);
      if (t) return parseFloat(t.value);
    }
    throw new Error(`no token ${name}`);
  };
  return {
    clickableRow: px('row-1'),
    twoLineRow: px('row-2'),
    tableRow: px('row-table'),
    rowPadY: px('space-row-y'),
    iconGap: px('space-icon-gap'),
    seam: px('space-row-seam'),
    captionToDemo: px('space-3'),
    demoBlocks: px('space-demo'),
    buttonGap: px('space-2'),
    labelToInput: px('space-2'),
    fieldToField: px('space-5'),
    barGap: px('space-3'),
    listLayerPad: px('space-2'),
    contentLayerPad: px('space-4'),
  };
}

// Runs inside the page: measures rendered geometry, not CSS text. Returns [{check, spec, actual, ok, where}].
function audit(S) {
  const out = [];
  const R = (e) => e.getBoundingClientRect();
  const vis = (e) => {
    const r = R(e);
    return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden';
  };
  const px = (v) => parseFloat(v) || 0;
  const name = (e) =>
    `${e.className && typeof e.className === 'string' ? `.${e.className.trim().split(/\s+/)[0]}` : e.tagName.toLowerCase()} "${(e.textContent || '').trim().slice(0, 16)}"`;
  const add = (check, spec, actual, ok, e) => out.push({ check, spec, actual, ok, where: e ? name(e) : '' });
  const all = (s) => [...document.querySelectorAll(s)].filter(vis);

  const ROWS =
    '.fa-item,.fa-trow,.fa-task,.fa-chg,.fa-conn,.fa-grp__h,.fa-step,.fa-cmd__row,.fa-more,.fa-fold__sum,button.fa-fold__cmd,.fa-run,.fa-dp summary,.fa-dp__head,.fa-sec__h--btn,tr[tabindex]';
  for (const e of all(ROWS)) {
    const h = Math.round(R(e).height);
    add('clickable row height', `>= ${S.clickableRow}`, h, h >= S.clickableRow, e);
  }
  const two = [
    ...all('.fa-chg'),
    ...all('.fa-trow:not(.fa-trow--1)').filter((e) => e.querySelector('.s')),
    ...all('.fa-task[aria-expanded=true]').filter((e) => e.querySelector('.sub')),
    ...all('.fa-cmd__row').filter((e) => e.querySelector('.l2') && !e.querySelector('.l3')),
  ];
  for (const e of two) {
    const h = Math.round(R(e).height);
    add('two-line row height', `${S.twoLineRow}`, h, h === S.twoLineRow, e);
  }
  for (const e of all('.fa-table tbody tr')) {
    const h = Math.round(R(e).height);
    add('table row height', `${S.tableRow}`, h, h === S.tableRow, e);
  }
  for (const e of all('.fa-cmd__row')) {
    if (!e.querySelector('.l3')) continue;
    const cs = getComputedStyle(e);
    const v = Math.min(px(cs.paddingTop) + px(cs.borderTopWidth), px(cs.paddingBottom) + px(cs.borderBottomWidth));
    add('three-line row vertical padding', `>= ${S.rowPadY}`, v, v >= S.rowPadY, e);
  }
  const ICONROWS = '.fa-kv>span:first-child,.fa-trow,.fa-task,.fa-chg,.fa-conn,.fa-item,.fa-cmd__row.has-lead,.fa-sec__err';
  for (const e of all(ICONROWS)) {
    const ic = [...e.children].find(
      (c) =>
        vis(c) &&
        (c.matches('svg,.fa-agent,.lead,.ty,.fa-dot,.fa-checkbox,input[type=checkbox]') ||
          (c.querySelector && c.children.length === 1 && c.querySelector(':scope>svg'))),
    );
    if (!ic) continue;
    const nx = ic.nextElementSibling;
    if (!nx || !vis(nx)) continue;
    const g = Math.round(R(nx).left - R(ic).right);
    add('icon to text', `${S.iconGap}`, g, g === S.iconGap, e);
  }
  for (const e of all('.fa-item,.fa-trow,.fa-task,.fa-chg,.fa-conn,.fa-cmd__row,.fa-step')) {
    const n = e.nextElementSibling;
    const first = e.className.split(' ')[0];
    if (!n || !vis(n) || !n.matches(first ? `.${first}` : '*')) continue;
    const cs = getComputedStyle(e);
    const ns = getComputedStyle(n);
    const seam =
      (cs.backgroundClip === 'padding-box' ? px(cs.borderBottomWidth) : 0) +
      (ns.backgroundClip === 'padding-box' ? px(ns.borderTopWidth) : 0) +
      Math.max(0, Math.round(R(n).top - R(e).bottom));
    add('gap between adjacent row fills', `>= ${S.seam}`, seam, seam >= S.seam, e);
  }
  for (const e of all('.fa-cap:not(caption),.fa-lbl')) {
    const n = e.nextElementSibling;
    if (!n || !vis(n) || n.matches('.fa-cap,.fa-lbl,script')) continue;
    const g = Math.round(R(n).top - R(e).bottom);
    if (g < 0 || g > 200) continue;
    add('caption to demo', `>= ${S.captionToDemo}`, g, g >= S.captionToDemo, e);
  }
  for (const st of all('.fa-stage')) {
    const kids = [...st.children].filter((c) => vis(c) && getComputedStyle(c).position !== 'absolute');
    for (let i = 1; i < kids.length; i++) {
      if (kids[i].matches('.fa-field') && kids[i - 1].matches('.fa-field')) continue;
      const g = Math.round(R(kids[i]).top - R(kids[i - 1]).bottom);
      if (g < 0) continue;
      add('between demo blocks', `>= ${S.demoBlocks}`, g, g >= S.demoBlocks, kids[i]);
    }
  }
  for (const b of all('.fa-btn')) {
    const n = b.nextElementSibling;
    if (!n || !vis(n) || !n.matches('.fa-btn')) continue;
    if (Math.abs(R(n).top - R(b).top) > 4) continue;
    const g = Math.round(R(n).left - R(b).right);
    add('between buttons', `>= ${S.buttonGap}`, g, g >= S.buttonGap, b);
  }
  for (const f of all('.fa-field')) {
    const l = f.querySelector('label');
    const i = f.querySelector('input,textarea,select,.fa-input');
    if (l && i && vis(l) && vis(i)) {
      const g = Math.round(R(i).top - R(l).bottom);
      add('label to input', `${S.labelToInput}`, g, g === S.labelToInput, f);
    }
    const n = f.nextElementSibling;
    if (n?.matches('.fa-field') && vis(n)) {
      const g = Math.round(R(n).top - R(f).bottom);
      add('field to field', `${S.fieldToField}`, g, g === S.fieldToField, f);
    }
  }
  for (const bar of all('.fa-composer__foot,.fa-composer__bar,.fa-composer--compact')) {
    const kids = [...bar.children].filter((c) => vis(c) && R(c).width > 1 && !c.matches('.fa-composer__grow,textarea'));
    for (let i = 1; i < kids.length; i++) {
      const a = kids[i - 1];
      const b = kids[i];
      const ga = a.matches('.fa-select--ghost') ? px(getComputedStyle(a).paddingRight) : 0;
      const gb = b.matches('.fa-select--ghost') ? px(getComputedStyle(b).paddingLeft) : 0;
      const g = Math.round(R(b).left - R(a).right + ga + gb);
      add('composer bar spacing', `>= ${S.barGap}`, g, g >= S.barGap, b);
    }
  }
  for (const p of all('.fa-pop:not(.fa-pop--pad):not(.fa-pop--two),.fa-cmd,.fa-toast')) {
    const v = px(getComputedStyle(p).paddingTop);
    add('list layer padding', `${S.listLayerPad}`, v, v === S.listLayerPad, p);
  }
  for (const p of all('.fa-pop--pad,.fa-dialog')) {
    const v = px(getComputedStyle(p).paddingTop);
    add('content layer / dialog padding', `>= ${S.contentLayerPad}`, v, v >= S.contentLayerPad, p);
  }
  return out;
}

// At a phone width: the page does not scroll sideways, and no control or read-only strip cuts its text with an
// ellipsis. Titles and summaries of variable length may truncate; controls collapse with container queries instead.
function narrow(width) {
  const out = [];
  const over = Math.round(document.documentElement.scrollWidth - innerWidth);
  out.push({ check: `${width}px: page overflow`, spec: '0', actual: Math.max(0, over), ok: over <= 0, where: '' });
  const CONTROLS = '.fa-btn,.fa-select,.fa-seg,.fa-composer__meta,.fa-composer__bar,.fa-composer__foot';
  for (const e of document.querySelectorAll('body *')) {
    if (getComputedStyle(e).textOverflow !== 'ellipsis' || !e.getBoundingClientRect().width || !e.closest(CONTROLS)) continue;
    const cut = e.scrollWidth > e.clientWidth + 1;
    const where = `${typeof e.className === 'string' && e.className ? e.className : e.tagName} "${e.textContent.trim().slice(0, 20)}"`;
    out.push({ check: `${width}px: control text cut`, spec: '0', actual: cut ? 1 : 0, ok: !cut, where });
  }
  return out;
}

export const NARROW = 360;

export default async function density() {
  const { base, browser, pages } = await browserSession();
  const spec = densitySpec();
  const lines = [];
  let total = 0;
  let bad = 0;
  const byCheck = new Map();
  const record = (label, rows) => {
    for (const r of rows) {
      total++;
      const agg = byCheck.get(r.check) || { spec: r.spec, n: 0, min: Infinity, max: -Infinity, fails: [] };
      agg.n++;
      agg.min = Math.min(agg.min, r.actual);
      agg.max = Math.max(agg.max, r.actual);
      if (!r.ok) {
        bad++;
        agg.fails.push(`${label}: ${r.where} = ${r.actual}`);
      }
      byCheck.set(r.check, agg);
    }
  };
  for (const width of [1000, NARROW]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    for (const p of pages) {
      await page.goto(`${base}${p.url}?theme=light`);
      await p.ready(page);
      if (width === NARROW) record(`${p.label} @${NARROW}`, await page.evaluate(narrow, NARROW));
      else record(p.label, await page.evaluate(audit, spec));
    }
    await context.close();
  }
  lines.push(`${pages.length} pages at 1000px (density table) and ${NARROW}px (overflow), ${total} measurements, ${bad} below spec`);
  lines.push('check                            spec   measured   count  fails');
  for (const [check, a] of byCheck) {
    lines.push(`${check.padEnd(32)} ${a.spec.padEnd(6)} ${`${a.min}-${a.max}`.padEnd(10)} ${String(a.n).padStart(5)}  ${a.fails.length}`);
    for (const f of a.fails.slice(0, 5)) lines.push(`    ${f}`);
  }
  return { ok: bad === 0, lines };
}
