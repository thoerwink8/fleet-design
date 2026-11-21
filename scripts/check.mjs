import { closeBrowserSession } from './lib/browser.mjs';

const CHECKS = [
  ['tokens match baseline', './checks/tokens.mjs'],
  ['styles match baseline', './checks/styles.mjs'],
  ['dist is current', './checks/dist.mjs'],
  ['rules: type scale, weights, spacing, colours, monospace', './checks/rules.mjs'],
  ['contrast, 8 themes x 3 brands', './checks/contrast.mjs'],
  ['data colours under colour-vision deficiency', './checks/cvd.mjs'],
  ['tailwind theme compiles to the variables', './checks/tailwind.mjs'],
  ['rendered styles match baseline (browser)', './checks/render.mjs'],
  ['density spec (browser)', './checks/density.mjs'],
  ['public-repo hygiene', './checks/hygiene.mjs'],
  ['format and lint (biome)', './checks/lint.mjs'],
];

const only = process.argv.slice(2);
const selected = CHECKS.filter(([, mod]) => !only.length || only.some((o) => mod.includes(o)));
if (!selected.length) {
  console.error(`no check matches ${only.join(' ')}`);
  process.exit(1);
}
let failed = 0;
for (const [title, mod] of selected) {
  const started = Date.now();
  let result;
  try {
    result = await (await import(mod)).default();
  } catch (err) {
    result = { ok: false, lines: [String(err?.stack || err)] };
  }
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`\n${result.ok ? 'PASS' : 'FAIL'}  ${title}  (${secs}s)`);
  for (const line of result.lines) console.log(`  ${line}`);
  if (!result.ok) failed++;
}
await closeBrowserSession();
console.log(failed ? `\n${failed} check(s) failed` : `\nall ${selected.length} checks passed`);
process.exit(failed ? 1 : 0);
