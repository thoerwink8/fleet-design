import fs from 'node:fs';
import path from 'node:path';
import { browserSession } from '../lib/browser.mjs';
import { root } from '../lib/tokens.mjs';

const THEMES = ['light', 'dark'];

// Every element's full computed style, one string per element.
function snapshot() {
  return [...document.querySelectorAll('body *')].map((e) => {
    const cs = getComputedStyle(e);
    const props = [];
    for (const p of cs) props.push(`${p}:${cs.getPropertyValue(p)}`);
    props.sort();
    return { tag: e.tagName.toLowerCase(), cls: typeof e.className === 'string' ? e.className : '', style: props.join(';') };
  });
}

// Renders every card with dist/styles.css and again with the baseline bundle.css, and compares computed styles.
export default async function render() {
  const { base, browser, cards } = await browserSession();
  const baseline = fs.readFileSync(path.join(root, 'test', 'fixtures', 'bundle.css'), 'utf8');
  const context = await browser.newContext({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const lines = [];
  let elements = 0;
  const diffs = [];
  const load = async (url, useBaseline) => {
    const page = await context.newPage();
    if (useBaseline) await page.route('**/dist/styles.css', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: baseline }));
    await page.goto(url);
    await page.waitForTimeout(400);
    const snap = await page.evaluate(snapshot);
    await page.close();
    return snap;
  };
  for (const theme of THEMES) {
    for (const card of cards) {
      const url = `${base}/cards/${card}.html?theme=${theme}`;
      const [a, b] = [await load(url, true), await load(url, false)];
      elements += a.length;
      if (a.length !== b.length) {
        diffs.push(`${card}/${theme}: ${a.length} elements with the baseline, ${b.length} with dist`);
        continue;
      }
      for (let i = 0; i < a.length; i++) {
        if (a[i].style === b[i].style) continue;
        const pa = new Map(a[i].style.split(';').map((x) => [x.slice(0, x.indexOf(':')), x]));
        const changed = b[i].style.split(';').filter((x) => pa.get(x.slice(0, x.indexOf(':'))) !== x);
        diffs.push(`${card}/${theme}: <${a[i].tag} class="${a[i].cls}"> ${changed.slice(0, 3).join('; ')}`);
      }
    }
  }
  await context.close();
  lines.push(`${cards.length} cards x ${THEMES.join(', ')}: ${elements} elements compared, every computed property`);
  if (diffs.length)
    lines.push(
      `${diffs.length} element(s) render differently from the baseline bundle.css:`,
      ...diffs.slice(0, Number(process.env.RENDER_SHOW || 20)).map((d) => `  ${d}`),
    );
  else lines.push('dist/styles.css renders every element exactly as the baseline bundle.css');
  return { ok: diffs.length === 0, lines };
}
