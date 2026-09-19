// Lists every built file with its raw GitHub URL at a given commit, as input for
// Hatchable's import_file_from_url (dist/<file> → public/<file>).
// Usage: node scripts/hatchable-files.mjs [commit-sha]
import { execSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const REPO = 'alerak06/straznik-trasy';
const sha = process.argv[2] ?? execSync('git rev-parse HEAD').toString().trim();

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

for (const file of walk('dist')) {
  const rel = relative('dist', file);
  console.log(`https://raw.githubusercontent.com/${REPO}/${sha}/dist/${rel}\tpublic/${rel}`);
}
