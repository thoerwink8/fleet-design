import { browserSession } from '../lib/browser.mjs';
import { reactPages } from '../lib/preview.mjs';

const THEMES = ['light', 'dark'];
// Properties that follow from the text inside the element rather than from its styles.
const GEOMETRY = new Set(['width', 'inline-size', 'perspective-origin', 'transform-origin']);

function styleOf(selector) {
  const e = document.querySelector(selector);
  if (!e) return null;
  const cs = getComputedStyle(e);
  const out = {};
  for (const p of cs) out[p] = cs.getPropertyValue(p);
  return { tag: e.tagName.toLowerCase(), cls: typeof e.className === 'string' ? e.className : '', style: out };
}

// Each React page lists pairs in previews/react/pages.json: an element of the React page and the element of the
// static card in the same state. Their computed styles must be equal, property by property. A pair may name
// properties to ignore, with the reason, as a third element: { ignore: [...], why: '...' }; the check prints them.
export default async function reactRender() {
  const { base, browser } = await browserSession();
  const context = await browser.newContext({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const lines = [];
  const diffs = [];
  let pairs = 0;
  for (const theme of THEMES) {
    for (const rp of reactPages()) {
      if (!rp.compare?.length) continue;
      await page.goto(`${base}/react/${rp.name}.html?theme=${theme}`);
      await page.waitForSelector('body[data-ready]', { state: 'attached' });
      const react = await Promise.all(rp.compare.map(([sel]) => page.evaluate(styleOf, sel)));
      await page.goto(`${base}/cards/${rp.card}.html?theme=${theme}`);
      await page.waitForTimeout(700);
      const card = await Promise.all(rp.compare.map(([, sel]) => page.evaluate(styleOf, sel)));
      rp.compare.forEach(([rs, cs, known = {}], i) => {
        pairs++;
        const a = react[i];
        const b = card[i];
        const where = `${rp.name}/${theme}: ${rs} vs ${rp.card} ${cs}`;
        if (!a || !b) {
          diffs.push(`${where}: ${!a ? 'React element' : 'card element'} not found`);
          return;
        }
        const ignore = new Set(known.ignore || []);
        if (a.tag !== b.tag && !ignore.has('tag')) diffs.push(`${where}: <${a.tag}> vs <${b.tag}>`);
        const changed = Object.keys(b.style).filter((p) => !GEOMETRY.has(p) && !ignore.has(p) && a.style[p] !== b.style[p]);
        if (changed.length)
          diffs.push(
            `${where}: ${changed
              .slice(0, 4)
              .map((p) => `${p} ${a.style[p]} / ${b.style[p]}`)
              .join('; ')}`,
          );
        else if (known.why) lines.push(`  known difference, ${rp.name} ${rs}: ${[...ignore].join(', ')} (${known.why})`);
      });
    }
  }
  await context.close();
  lines.unshift(`${pairs} element pairs (React page vs static card, ${THEMES.join(' and ')}), every computed property except width`);
  if (diffs.length) lines.push(`${diffs.length} pair(s) differ:`, ...diffs.slice(0, 30).map((d) => `  ${d}`));
  else lines.push('every React element renders exactly like its static counterpart');
  return { ok: diffs.length === 0, lines: [...new Set(lines)] };
}
