import fs from 'node:fs';
import path from 'node:path';
import { root } from './tokens.mjs';

export const stylesDir = path.join(root, 'styles');

export function styleFiles() {
  const index = fs.readFileSync(path.join(stylesDir, 'index.css'), 'utf8');
  return [...index.matchAll(/@import\s+"\.\/([\w-]+\.css)";/g)].map((m) => m[1]);
}

export function concatStyles() {
  return styleFiles()
    .map((f) => fs.readFileSync(path.join(stylesDir, f), 'utf8'))
    .join('');
}
