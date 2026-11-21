// Accepts the current build as the new baseline. Run only for an intentional change to a value or a rule,
// after pnpm check has shown exactly what moved, and say why in the commit.
import fs from 'node:fs';
import path from 'node:path';
import { outputs } from './lib/outputs.mjs';
import { root } from './lib/tokens.mjs';

const out = outputs();
const fixtures = path.join(root, 'test', 'fixtures');
const write = (name, text) => {
  fs.writeFileSync(path.join(fixtures, name), text);
  console.log(`updated test/fixtures/${name}`);
};
write('tokens.json', out['dist/tokens.json']);
write('tokens.css', out['dist/tokens.css']);
write('bundle.css', out['dist/styles.css']);
