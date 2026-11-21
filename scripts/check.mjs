const CHECKS = [
  ['tokens match baseline', './checks/tokens.mjs'],
  ['styles match baseline', './checks/styles.mjs'],
  ['dist is current', './checks/dist.mjs'],
  ['format and lint (biome)', './checks/lint.mjs'],
];

const only = process.argv.slice(2);
let failed = 0;
for (const [title, mod] of CHECKS) {
  if (only.length && !only.some((o) => mod.includes(o))) continue;
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
console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
