import fs from 'node:fs';
import path from 'node:path';
import { outputs } from './lib/outputs.mjs';
import { createPreviewServer, listen } from './lib/preview.mjs';
import { root } from './lib/tokens.mjs';

const pidFile = path.join(root, '.dev-server.pid');
const port = Number(process.env.PORT || 5178);

function build() {
  for (const [rel, text] of Object.entries(outputs())) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== text) {
      fs.writeFileSync(file, text);
      console.log(`rebuilt ${rel}`);
    }
  }
}

if (fs.existsSync(pidFile)) {
  const { pid } = JSON.parse(fs.readFileSync(pidFile, 'utf8'));
  let alive = false;
  try {
    process.kill(pid, 0);
    alive = true;
  } catch {}
  if (alive) {
    console.error(`a preview server started by pnpm dev is already running (pid ${pid}); run pnpm stop first`);
    process.exit(1);
  }
}

build();
const actual = await listen(createPreviewServer(), port);
fs.writeFileSync(pidFile, JSON.stringify({ pid: process.pid, port: actual }));
console.log(`previews at http://127.0.0.1:${actual}/  (pid ${process.pid}; pnpm stop or Ctrl+C to stop)`);

let timer;
for (const dir of ['tokens', 'styles']) {
  fs.watch(path.join(root, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        build();
      } catch (err) {
        console.error(String(err));
      }
    }, 100);
  });
}

const cleanup = () => {
  try {
    const { pid } = JSON.parse(fs.readFileSync(pidFile, 'utf8'));
    if (pid === process.pid) fs.rmSync(pidFile);
  } catch {}
  process.exit(0);
};
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
