// Reads knowledge markdown files and indexes them into the RAG service
// Usage: node proweleu-brain/tools/index-knowledge.mjs

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const RAG_INDEX_URL = process.env.RAG_INDEX_URL || 'http://localhost:8001/index';
const repoRoot = process.cwd();
const knowledgeDir = path.join(repoRoot, 'docs', 'proweleu-brain', 'knowledge');

async function loadDocs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const docs = [];
  for (const ent of entries) {
    if (ent.isFile() && ent.name.endsWith('.md')) {
      const full = path.join(dir, ent.name);
      const text = await readFile(full, 'utf-8');
      docs.push({ doc_id: ent.name, text });
    }
  }
  return docs;
}

async function main() {
  const docs = await loadDocs(knowledgeDir);
  if (!docs.length) {
    console.error('No markdown files found in', knowledgeDir);
    process.exit(1);
  }
  const resp = await fetch(RAG_INDEX_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docs, chunk_size: 400 })
  });
  const json = await resp.json();
  console.log('Indexed:', json);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

