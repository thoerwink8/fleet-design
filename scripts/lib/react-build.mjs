import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { root } from './tokens.mjs';

const tsc = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');

// Compiles react/ into outDir (ESM + .d.ts), one file per source file, through tsconfig.build.json.
export function buildReact(outDir = path.join(root, 'dist', 'react')) {
  fs.rmSync(outDir, { recursive: true, force: true });
  execFileSync(process.execPath, [tsc, '-p', path.join(root, 'tsconfig.build.json'), '--outDir', outDir], { cwd: root, stdio: 'pipe' });
  return outDir;
}

// Relative path -> content for every file under dir.
export function readTree(dir) {
  const out = {};
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out[path.relative(dir, p).split(path.sep).join('/')] = fs.readFileSync(p, 'utf8');
    }
  };
  if (fs.existsSync(dir)) walk(dir);
  return out;
}

// Builds into a temporary directory and compares it with the committed dist/react.
export function compareReactDist() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fleet-react-'));
  try {
    const fresh = readTree(buildReact(tmp));
    const committed = readTree(path.join(root, 'dist', 'react'));
    const names = new Set([...Object.keys(fresh), ...Object.keys(committed)]);
    const problems = [];
    for (const n of [...names].sort()) {
      if (!(n in committed)) problems.push(`dist/react/${n}: missing`);
      else if (!(n in fresh)) problems.push(`dist/react/${n}: not produced by the build any more`);
      else if (fresh[n] !== committed[n]) problems.push(`dist/react/${n}: stale`);
    }
    return { files: Object.keys(fresh).length, problems };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
