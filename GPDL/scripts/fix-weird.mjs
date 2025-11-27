#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

const map = JSON.parse(readFileSync(new URL('./encoding-map.json', import.meta.url)));
const roots = ['resources'];
const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.php', '.blade.php', '.md']);

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.git')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (exts.has(extname(entry.name))) fixFile(full);
  }
}

let changes = 0;
function fixFile(file) {
  let raw = readFileSync(file, 'utf8');
  let before = raw;
  // Normalize Windows mojibake sequences via mapping
  for (const [bad, good] of Object.entries(map)) {
    raw = raw.split(bad).join(good);
  }
  // Replace generic replacement chars if present (best effort)
  raw = raw.replace(/[�]/g, '');
  if (raw !== before) {
    writeFileSync(file, raw, 'utf8');
    console.log(`Fixed: ${file}`);
    changes++;
  }
}

roots.forEach((r) => walk(r));
console.log(`\nEncoding fixes applied to ${changes} file(s).`);

