import fs from 'node:fs';
import path from 'node:path';
import { outputs } from './lib/outputs.mjs';
import { root } from './lib/tokens.mjs';

for (const [rel, text] of Object.entries(outputs())) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  console.log(`wrote ${rel} (${Buffer.byteLength(text)} bytes)`);
}
