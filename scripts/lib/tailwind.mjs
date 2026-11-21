import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { compile } from 'tailwindcss';
import { root } from './tokens.mjs';

const require = createRequire(import.meta.url);
const twDir = path.dirname(require.resolve('tailwindcss/package.json'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

// Resolves an import the way a consumer's bundler would: tailwindcss from node_modules, this package through its own
// exports map (a missing export fails here), anything else relative to the importing file.
function resolve(id, base) {
  if (id.startsWith('tailwindcss/')) return path.join(twDir, id.slice('tailwindcss/'.length));
  if (id.startsWith(`${pkg.name}/`)) {
    const target = pkg.exports[`./${id.slice(pkg.name.length + 1)}`];
    if (typeof target !== 'string') throw new Error(`${id} is not a CSS export of ${pkg.name}`);
    return path.join(root, target);
  }
  return path.resolve(base, id);
}

// Compiles a Tailwind v4 entry stylesheet for the given class names and returns the CSS.
export async function compileTailwind(input, candidates) {
  const compiler = await compile(input, {
    base: root,
    loadStylesheet: async (id, base) => {
      const file = resolve(id, base);
      return { path: file, base: path.dirname(file), content: fs.readFileSync(file, 'utf8') };
    },
  });
  return compiler.build(candidates);
}

// The declarations Tailwind produced for one utility class, or null when the class does not exist.
export function ruleFor(css, utility) {
  const m = css.match(new RegExp(`\\.${utility.replace(/[-[\]]/g, '\\$&')}\\s*\\{([^}]*)\\}`));
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}
