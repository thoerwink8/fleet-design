import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { root } from '../lib/tokens.mjs';

// TypeScript over the React components, their preview pages and the interaction tests (tsconfig.json, no emit).
export default async function types() {
  try {
    execFileSync(process.execPath, [path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', path.join(root, 'tsconfig.json')], {
      cwd: root,
      stdio: 'pipe',
      encoding: 'utf8',
    });
    return { ok: true, lines: ['tsc -p tsconfig.json: no errors (react/, previews/react/, test/react/)'] };
  } catch (err) {
    return {
      ok: false,
      lines: String(err.stdout || err.message)
        .trim()
        .split('\n')
        .slice(0, 30),
    };
  }
}
