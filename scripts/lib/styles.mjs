import fs from 'node:fs';
import path from 'node:path';
import { root } from './tokens.mjs';

export const stylesDir = path.join(root, 'styles');

// The files that make up styles.css, in cascade order. reset.css is not one of them.
export function styleFiles() {
  const index = fs.readFileSync(path.join(stylesDir, 'index.css'), 'utf8');
  return [...index.matchAll(/@import\s+"\.\/([\w-]+\.css)";/g)].map((m) => m[1]);
}

export function concatStyles() {
  return styleFiles()
    .map((f) => fs.readFileSync(path.join(stylesDir, f), 'utf8'))
    .join('');
}

// The optional page reset: the only rules that select bare elements. Shipped as its own file, never inside styles.css.
export const RESET = 'reset.css';
export const resetCss = () => fs.readFileSync(path.join(stylesDir, RESET), 'utf8');
