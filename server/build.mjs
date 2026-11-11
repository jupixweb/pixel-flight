import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';

const dist = new URL('../dist/', import.meta.url);
const assets = {};
for (const entry of await readdir(dist, { withFileTypes: true })) {
  if (entry.isFile() && /\.(html|js|css)$/.test(entry.name)) {
    assets['/' + entry.name] = await readFile(new URL(entry.name, dist), 'utf8');
  }
}
const daily = assets['/daily.js'];
const worker = await readFile(new URL('./worker.mjs', import.meta.url), 'utf8');
await mkdir(new URL('server/', dist), { recursive: true });
await writeFile(new URL('server/index.js', dist),
  'const window = {};\n' + daily + '\nconst assets = ' + JSON.stringify(assets) + ';\n' + worker);
