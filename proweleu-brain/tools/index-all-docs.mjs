// Index all repository docs (Markdown/Text) into RAG via /ingest
// Usage: node proweleu-brain/tools/index-all-docs.mjs

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const RAG_INGEST_URL = process.env.RAG_INGEST_URL || 'http://localhost:8001/ingest';

const repoRoot = process.cwd();
const includeRoots = [
  '.',
  'docs',
  path.join('docs', 'proweleu-brain'),
  path.join('proweleu-brain'),
  path.join('proweleu-brain', 'apps', 'rag-service'), // for local examples/README if any
  'client',
];

const ignoreDirs = new Set(['.git', 'node_modules', '.venv', 'dist', 'build', '.next', '.cache', '__pycache__']);
const allowExt = new Set(['.md', '.markdown', '.txt']);
const maxFileSize = 300_000; // 300 KB safety cap per file

async function walk(dir, acc) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    const rel = path.relative(repoRoot, full);
    if (ent.isDirectory()) {
      if (ignoreDirs.has(ent.name)) continue;
      await walk(full, acc);
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase();
      if (!allowExt.has(ext)) continue;
      const st = await stat(full);
      if (st.size > maxFileSize) continue;
      acc.push(rel);
    }
  }
}

async function gatherFiles() {
  const files = new Set();
  for (const root of includeRoots) {
    const abs = path.join(repoRoot, root);
    try {
      const st = await stat(abs);
      if (st.isDirectory()) {
        await walk(abs, files);
      } else if (st.isFile()) {
        files.add(path.relative(repoRoot, abs));
      }
    } catch {
      // ignore missing roots
    }
  }
  return Array.from(files).sort();
}

async function main() {
  const files = await gatherFiles();
  if (!files.length) {
    console.error('No docs found to ingest');
    process.exit(1);
  }

  const docs = [];
  for (const rel of files) {
    const full = path.join(repoRoot, rel);
    const text = await readFile(full, 'utf-8');
    const doc_id = rel.replaceAll(path.sep, '/');
    docs.push({ doc_id, text, tags: ['repo-doc'] });
  }

  // Send in batches to avoid large payloads
  const batchSize = 20;
  let sent = 0;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize).map(d => ({
      doc_id: d.doc_id,
      text: d.text,
      tags: d.tags,
      chunk_size: 1000,
      overlap: 150,
      version: 'v1'
    }));
    const resp = await fetch(RAG_INGEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docs: batch })
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Ingest failed (${resp.status}): ${txt}`);
    }
    const json = await resp.json();
    console.log(`Ingested batch ${i / batchSize + 1}:`, json);
    sent += batch.length;
  }
  console.log(`Done. Ingested ${sent} docs.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

