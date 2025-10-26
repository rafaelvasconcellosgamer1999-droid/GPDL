#!/usr/bin/env node
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.php', '.blade.php', '.md']);
const roots = ['resources', 'routes', 'app', 'config'];
const weirdPatterns = [
  /\uFFFD/, // replacement character
  /[�]/, // common rendered replacement
  /[ǜǭǧ]/, // common mojibake seen in repo
  /Distribui..o/, // misencoded Distribuição
  /Guia r.pido/,
  /N��/, /an. lise/, /publica..es/, /respons. vel/, /Voc./
];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.git')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else {
      const ext = entry.name.slice(entry.name.lastIndexOf('.'));
      if (exts.has(ext)) checkFile(full);
    }
  }
}

let found = 0;
function checkFile(file) {
  const raw = readFileSync(file, 'utf8');
  const lines = raw.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (weirdPatterns.some((rx) => rx.test(line))) {
      found++;
      console.log(`${file}:${i + 1}: ${line}`);
    }
  });
}

roots.forEach((r) => walk(r));

if (found > 0) {
  console.error(`\nFound ${found} lines with potential encoding issues.`);
  process.exitCode = 1;
} else {
  console.log('No suspicious characters found.');
}

