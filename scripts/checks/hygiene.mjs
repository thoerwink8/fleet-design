import fs from 'node:fs';
import path from 'node:path';
import { root } from '../lib/tokens.mjs';

const SKIP_DIRS = new Set(['.git', 'node_modules', 'test-results']);
const IMAGE = /\.(png|jpe?g|gif|webp|bmp|avif|ico|psd|fig|sketch)$/i;
const self = path.join('scripts', 'checks', 'hygiene.mjs');

// Assembled from parts so this file does not match itself.
const j = (...p) => p.join('');
const PATTERNS = [
  ['local Windows user path', new RegExp(j('[A-Za-z]:', '\\\\{1,2}', 'Users', '\\\\{1,2}', '(?!dev\\b)\\w+'), 'i')],
  ['machine or account name', new RegExp(j('Admin', 'istrator', '|DESK', 'TOP-[A-Z0-9]'), 'i')],
  ['email address', /[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i],
  ['private project name', new RegExp(j('mira', 'sim|fleet-', 'dao|fleet-', 'base|ashare-', 'copilot'), 'i')],
  ['product named as a density reference', new RegExp(j('Claude ', '(desktop|桌面)'), 'i')],
];
const ALLOW_EMAIL = /noreply|@fleet\/design|@biomejs|@tailwindcss|@playwright|@types/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

export default async function hygiene() {
  const problems = [];
  const files = walk(root).map((f) => path.relative(root, f));
  for (const rel of files) {
    if (IMAGE.test(rel)) {
      problems.push(`${rel}: image files are not kept in this repository`);
      continue;
    }
    if (rel === self || rel === 'pnpm-lock.yaml') continue;
    const text = fs.readFileSync(path.join(root, rel), 'utf8');
    text.split('\n').forEach((line, i) => {
      for (const [what, re] of PATTERNS) {
        const m = line.match(re);
        if (!m) continue;
        if (what === 'email address' && ALLOW_EMAIL.test(m[0])) continue;
        problems.push(`${rel}:${i + 1}: ${what}: ${m[0]}`);
      }
    });
  }
  const lines = [`${files.length} files scanned for local paths, account names, emails, private project names and images`];
  if (problems.length) lines.push(...problems.slice(0, 30).map((p) => `  ${p}`));
  return { ok: problems.length === 0, lines };
}
