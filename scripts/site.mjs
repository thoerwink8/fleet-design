import fs from 'node:fs';
import path from 'node:path';
import { bundleReactPage, cardPage, cards, reactPage, reactPages } from './lib/preview.mjs';
import { root } from './lib/tokens.mjs';

const outDir = path.join(root, 'site');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const write = (rel, data) => {
  const dest = path.join(outDir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, data);
};

const copy = (srcRel, destRel = srcRel) => {
  const dest = path.join(outDir, destRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(root, srcRel), dest);
};

// Home shell and its static data/assets
write('index.html', fs.readFileSync(path.join(root, 'previews', 'index.html')));
for (const file of ['shell.css', 'shell.js', 'cards.json']) {
  copy(path.join('previews', file));
}
copy(path.join('previews', 'react', 'pages.json'));
copy(path.join('tokens', 'themes.json'));

// Built CSS used by index, cards and React pages
for (const file of ['tokens.css', 'reset.css', 'styles.css']) {
  copy(path.join('dist', file));
}

// Static cards
const cardList = cards();
for (const c of cardList) {
  write(path.join('cards', `${c.name}.html`), cardPage(c.name));
}

// React preview pages and pre-bundled module scripts
const reactList = reactPages();
await Promise.all(
  reactList.map(async (r) => {
    write(path.join('react', `${r.name}.html`), reactPage(r.name));
    write(path.join('react', `${r.name}.js`), await bundleReactPage(r.name));
  }),
);

// Prevent GitHub Pages Jekyll processing so directories/files resolve as-is
write('.nojekyll', '');

console.log(
  `wrote site/ (${1 + cardList.length + reactList.length} html pages: 1 index, ${cardList.length} cards, ${reactList.length} react)`,
);
