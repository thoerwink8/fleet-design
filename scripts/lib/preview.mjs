import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { root } from './tokens.mjs';

const previews = path.join(root, 'previews');
export const cards = () => JSON.parse(fs.readFileSync(path.join(previews, 'cards.json'), 'utf8'));
const lib = (f) => fs.readFileSync(path.join(previews, 'lib', f), 'utf8');

const HEAD = `<script>(()=>{const q=new URLSearchParams(location.search),r=document.documentElement;const t=q.get('theme');if(t)r.dataset.theme=t;const p=q.get('project');if(p&&p!=='fleet')r.dataset.project=p;})()</script>
<link rel="stylesheet" href="/dist/tokens.css">
<link rel="stylesheet" href="/dist/styles.css">`;

// A card is an HTML fragment; the page around it loads the built dist/ styles, never a copy.
export function cardPage(name) {
  const fragment = fs
    .readFileSync(path.join(previews, 'cards', `${name}.html`), 'utf8')
    .replace('/*PRELUDE*/', () => lib('prelude.js'))
    .replace('/*SESSION*/', () => lib('session-lib.js'));
  return `<!doctype html>
<html lang="zh-CN" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name}</title>
${HEAD}
</head>
<body>
${fragment}
</body>
</html>
`;
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};
const STATIC = ['dist', 'previews', 'tokens'];

export function createPreviewServer() {
  const names = new Set(cards().map((c) => c.name));
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const send = (code, type, body) => {
      res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' });
      res.end(body);
    };
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, 'text/plain', 'method not allowed');
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return send(400, 'text/plain', 'bad path');
    }
    if (pathname === '/') return send(200, TYPES['.html'], fs.readFileSync(path.join(previews, 'index.html')));
    const card = pathname.match(/^\/cards\/([\w-]+)\.html$/);
    if (card) return names.has(card[1]) ? send(200, TYPES['.html'], cardPage(card[1])) : send(404, 'text/plain', 'no such card');
    const top = pathname.split('/')[1];
    const file = path.join(root, pathname);
    if (
      !STATIC.includes(top) ||
      !file.startsWith(path.join(root, top) + path.sep) ||
      !fs.existsSync(file) ||
      fs.statSync(file).isDirectory()
    )
      return send(404, 'text/plain', 'not found');
    send(200, TYPES[path.extname(file)] || 'application/octet-stream', fs.readFileSync(file));
  });
}

export function listen(server, port) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server.address().port));
  });
}
