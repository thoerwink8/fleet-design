// Installs the packed package into an empty project, type-checks and bundles a page that uses only Button and Select,
// and reports what ended up in the bundle. Run after pnpm build. The temporary directory is removed at the end.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import zlib from 'node:zlib';
import { root } from './lib/tokens.mjs';

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const dev = pkg.devDependencies;
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fleet-smoke-'));
let failed = false;
try {
  run(`pnpm pack --pack-destination "${tmp}"`, root);
  const tgz = fs.readdirSync(tmp).find((f) => f.endsWith('.tgz'));
  if (!tgz) throw new Error('pnpm pack produced no tarball');
  const app = path.join(tmp, 'app');
  fs.mkdirSync(path.join(app, 'src'), { recursive: true });
  fs.writeFileSync(
    path.join(app, 'package.json'),
    JSON.stringify(
      {
        name: 'smoke-app',
        private: true,
        type: 'module',
        dependencies: {
          '@fleet/design': `file:../${tgz}`,
          '@base-ui/react': dev['@base-ui/react'],
          react: dev.react,
          'react-dom': dev['react-dom'],
        },
        devDependencies: {
          '@types/react': dev['@types/react'],
          '@types/react-dom': dev['@types/react-dom'],
          esbuild: dev.esbuild,
          typescript: dev.typescript,
        },
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(path.join(app, 'pnpm-workspace.yaml'), 'allowBuilds:\n  esbuild: false\n');
  fs.writeFileSync(
    path.join(app, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'es2022',
        module: 'esnext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        strict: true,
        noEmit: true,
        skipLibCheck: false,
      },
      include: ['src'],
    }),
  );
  const page = (from) => `import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fleet/design/tokens.css';
import '@fleet/design/styles/button.css';
import '@fleet/design/styles/select.css';
import '@fleet/design/styles/menu.css';
${from}

type Size = '14' | '15';
function App() {
  const [size, setSize] = useState<Size>('15');
  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setSize('14')}>发送</Button>
      <Select<Size> aria-label="字号" options={[{ value: '14', label: '标准' }, { value: '15', label: '较大' }]} value={size} onValueChange={setSize} />
    </>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
`;
  fs.writeFileSync(
    path.join(app, 'src', 'subpaths.tsx'),
    page("import { Button } from '@fleet/design/react/button';\nimport { Select } from '@fleet/design/react/select';"),
  );
  fs.writeFileSync(path.join(app, 'src', 'entry.tsx'), page("import { Button, Select } from '@fleet/design/react';"));
  // What a bundler template declares for CSS imports (TypeScript checks side-effect imports by default).
  fs.writeFileSync(path.join(app, 'src', 'env.d.ts'), "declare module '*.css';\n");
  // A type error must be caught: variant is a closed set.
  fs.writeFileSync(
    path.join(app, 'src', 'bad.tsx'),
    'import { Button } from \'@fleet/design/react/button\';\n// @ts-expect-error unknown variant\nexport const x = <Button variant="huge">x</Button>;\n',
  );

  run('pnpm install --prefer-offline --reporter=silent', app);
  run(`node "${path.join(app, 'node_modules', 'typescript', 'bin', 'tsc')}" -p tsconfig.json`, app);
  console.log('types: tsc passes (subpath and entry imports; an unknown variant is a type error)');

  const { build } = await import(pathToFileURL(path.join(app, 'node_modules', 'esbuild', 'lib', 'main.js')).href);
  for (const name of ['subpaths', 'entry']) {
    const out = await build({
      entryPoints: [path.join(app, 'src', `${name}.tsx`)],
      absWorkingDir: app,
      bundle: true,
      minify: true,
      write: false,
      metafile: true,
      format: 'esm',
      jsx: 'automatic',
      outdir: path.join(app, 'out'),
      define: { 'process.env.NODE_ENV': '"production"' },
      logLevel: 'silent',
    });
    const js = out.outputFiles.find((f) => f.path.endsWith('.js'));
    const css = out.outputFiles.find((f) => f.path.endsWith('.css'));
    const output = Object.values(out.metafile.outputs).find((o) => o.entryPoint);
    const ours = Object.entries(output.inputs).filter(([p]) => p.includes('@fleet/design') && p.endsWith('.js'));
    const used = ours.filter(([, i]) => i.bytesInOutput > 0).map(([p, i]) => `${p.split('/react/').pop()} ${kb(i.bytesInOutput)}`);
    const baseUi = new Set(
      Object.entries(output.inputs)
        .filter(([p, i]) => i.bytesInOutput > 0 && p.includes('@base-ui/react/'))
        .map(([p]) => p.split('@base-ui/react/')[1].split('/')[0]),
    );
    const extra = ours.filter(([p, i]) => i.bytesInOutput > 0 && !/react\/(button|select|internal)\.js$/.test(p));
    console.log(
      `${name}: js ${kb(js.contents.length)} (gzip ${kb(zlib.gzipSync(js.contents).length)}), css ${kb(css?.contents.length ?? 0)}; ` +
        `fleet-design code: ${used.join(', ')}; Base UI parts: ${[...baseUi].sort().join(', ')}`,
    );
    if (extra.length) {
      failed = true;
      console.log(`  other components ended up in the bundle: ${extra.map(([p]) => p).join(', ')}`);
    }
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
