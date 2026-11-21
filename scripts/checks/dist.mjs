import fs from 'node:fs';
import path from 'node:path';
import { outputs } from '../lib/outputs.mjs';
import { compareReactDist } from '../lib/react-build.mjs';
import { root } from '../lib/tokens.mjs';

export default async function dist() {
  const lines = [];
  let ok = true;
  for (const [rel, text] of Object.entries(outputs())) {
    const file = path.join(root, rel);
    const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (current === text) lines.push(`${rel}: up to date`);
    else {
      ok = false;
      lines.push(`${rel}: ${current === null ? 'missing' : 'stale'}; run pnpm build and commit dist/`);
    }
  }
  const react = compareReactDist();
  if (react.problems.length) {
    ok = false;
    lines.push(...react.problems, 'dist/react is stale; run pnpm build and commit dist/');
  } else lines.push(`dist/react: ${react.files} files equal a fresh build`);
  return { ok, lines };
}
