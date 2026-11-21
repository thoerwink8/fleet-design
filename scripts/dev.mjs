import fs from 'node:fs';
import net from 'node:net';
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

// A pid file left behind by a killed server must not block the next start: the recorded server counts as running only
// if its process exists and its port still answers (on Windows a pid can be reused by an unrelated process).
const answers = (port) =>
  new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    const done = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(500);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });

if (fs.existsSync(pidFile)) {
  let recorded = {};
  try {
    recorded = JSON.parse(fs.readFileSync(pidFile, 'utf8'));
  } catch {}
  let alive = false;
  try {
    process.kill(recorded.pid, 0);
    alive = await answers(recorded.port);
  } catch {}
  if (alive) {
    console.error(
      `a preview server started by pnpm dev is already running (pid ${recorded.pid}, port ${recorded.port}); run pnpm stop first`,
    );
    process.exit(1);
  }
  fs.rmSync(pidFile, { force: true });
  console.log(`removed a stale .dev-server.pid (pid ${recorded.pid} is not serving)`);
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
