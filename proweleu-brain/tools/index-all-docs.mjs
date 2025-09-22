// Index all repository docs (Markdown/Text) into RAG via /ingest
// Usage:
//   node proweleu-brain/tools/index-all-docs.mjs
//   node proweleu-brain/tools/index-all-docs.mjs docs/**/*.md client/README.md

import { fileURLToPath } from 'url';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import globby from 'globby';

const RAG_INGEST_URL = process.env.RAG_INGEST_URL || 'http://localhost:8001/ingest';

// Force working directory to repo root (tools/ -> proweleu-brain/ -> repo root)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
process.chdir(repoRoot);

// Allow custom patterns from CLI, else use robust defaults
const patterns = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      'README.md',
      'AGENTS.md',
      'client/README.md',
      'docs/**/*.md',
      'proweleu-brain/**/*.md',
      '!**/node_modules/**',
      '!**/.git/**',
      '!**/.venv/**',
      '!**/dist/**',
      '!**/build/**',
      '!**/.next/**',
      '!**/__pycache__/**',
    ];

const files = await globby(patterns, { gitignore: true, caseSensitiveMatch: false });
console.log('Found', files.length, 'markdown files');
if (!files.length) {
  console.error('No docs found to ingest');
  process.exit(1);
}

const batchSize = 20;
let sent = 0;

for (let i = 0; i < files.length; i += batchSize) {
  const slice = files.slice(i, i + batchSize);
  const docs = [];
  for (const rel of slice) {
    const text = await readFile(path.join(repoRoot, rel), 'utf-8');
    const doc_id = rel.replaceAll(path.sep, '/');
    docs.push({ doc_id, text, tags: ['repo-doc'], chunk_size: 1000, overlap: 150, version: 'v1' });
  }

  const resp = await fetch(RAG_INGEST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docs })
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Ingest failed (${resp.status}): ${txt}`);
  }
  const json = await resp.json();
  console.log(`Ingested batch ${i / batchSize + 1}:`, json);
  sent += docs.length;
}

console.log(`Done. Ingested ${sent} docs.`);
