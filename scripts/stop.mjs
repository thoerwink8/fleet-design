import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib/tokens.mjs';

const pidFile = path.join(root, '.dev-server.pid');
if (!fs.existsSync(pidFile)) {
  console.log('no preview server recorded by pnpm dev');
  process.exit(0);
}
const { pid, port } = JSON.parse(fs.readFileSync(pidFile, 'utf8'));
try {
  process.kill(pid, 'SIGTERM');
  console.log(`stopped the preview server (pid ${pid}, port ${port})`);
} catch (err) {
  if (err.code !== 'ESRCH') throw err;
  console.log(`pid ${pid} is no longer running`);
}
fs.rmSync(pidFile, { force: true });
