import { browserSession } from '../lib/browser.mjs';

// Every preview page loads all of its resources: no 4xx/5xx response and no failed request.
export default async function requests() {
  const { base, browser, pages } = await browserSession();
  const context = await browser.newContext({ viewport: { width: 1000, height: 900 } });
  const page = await context.newPage();
  const bad = [];
  let label = '';
  let count = 0;
  page.on('response', (r) => {
    count++;
    if (r.status() >= 400) bad.push(`${label}: ${r.status()} ${new URL(r.url()).pathname}`);
  });
  page.on('requestfailed', (r) => bad.push(`${label}: failed ${new URL(r.url()).pathname} (${r.failure()?.errorText})`));
  page.on('pageerror', (e) => bad.push(`${label}: script error ${String(e.message).split('\n')[0]}`));
  for (const p of pages) {
    label = p.label;
    await page.goto(`${base}${p.url}?theme=light`);
    await p.ready(page);
  }
  await context.close();
  const lines = [`${pages.length} pages, ${count} responses`];
  if (bad.length) lines.push(`${bad.length} problem(s):`, ...bad.slice(0, 30).map((b) => `  ${b}`));
  else lines.push('every request answered 2xx/3xx, no script errors');
  return { ok: bad.length === 0, lines };
}
