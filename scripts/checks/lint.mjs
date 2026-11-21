import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { root } from '../lib/tokens.mjs';

export default async function lint() {
  const bin = createRequire(import.meta.url).resolve('@biomejs/biome/bin/biome');
  const r = spawnSync(process.execPath, [bin, 'check', '--colors=off', '.'], { cwd: root, encoding: 'utf8' });
  const out = `${r.stdout}${r.stderr}`.split('\n').filter((l) => l.trim() && !/npm warn/.test(l));
  return { ok: r.status === 0, lines: r.status === 0 ? out.slice(-2) : out.slice(-40) };
}
