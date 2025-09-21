// RAG retriever placeholder using Atlas Vector Search
import mongoose from 'mongoose';

export type RAGFilter = { ticker?: 'SPX' | 'SPY'; doc_type?: string; date_range?: { from: string; to: string } };

type RagChunk = {
  doc_id: string;
  chunk_id: string;
  text: string;
  meta?: Record<string, unknown>;
  updated_at: Date;
};

const RagChunkSchema = new mongoose.Schema<RagChunk>({
  doc_id: { type: String, required: true },
  chunk_id: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  meta: { type: mongoose.Schema.Types.Mixed },
  updated_at: { type: Date, required: true }
});

const RagChunkModel = mongoose.models.RagChunk || mongoose.model<RagChunk>('RagChunk', RagChunkSchema, 'rag_chunks');

export async function indexDocs(docs: { doc_id: string; text: string }[], chunkSize = 400) {
  const writes: RagChunk[] = [];
  for (const d of docs) {
    const t = d.text.trim();
    for (let i = 0; i < t.length; i += chunkSize) {
      const chunk = t.slice(i, i + chunkSize);
      writes.push({
        doc_id: d.doc_id,
        chunk_id: `${d.doc_id}#${i}`,
        text: chunk,
        updated_at: new Date()
      });
    }
  }
  if (writes.length) {
    const ops = writes.map((w) => ({ updateOne: { filter: { chunk_id: w.chunk_id }, update: { $set: w }, upsert: true } }));
    await RagChunkModel.bulkWrite(ops);
  }
  return { ok: true, n: writes.length } as const;
}

export async function retrieveContext(query: string, topK = 6) {
  // Naive text search fallback until Atlas Vector Search is configured
  const all = await RagChunkModel.find({}, { text: 1, doc_id: 1, chunk_id: 1 }).limit(2000).lean();
  const scored = all
    .map((d) => ({ d, score: scoreText(query, d.text) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => x.d);

  const context = scored
    .slice(0, Math.min(4, scored.length))
    .map((d) => `[${d.doc_id}#${d.chunk_id}] ${d.text}`)
    .join('\n');

  const citations = scored.map((d) => `${d.doc_id}#${d.chunk_id}`);
  return { context, citations } as const;
}

function scoreText(q: string, t: string) {
  const terms = q.toLowerCase().split(/\W+/).filter(Boolean);
  const target = t.toLowerCase();
  let s = 0;
  for (const term of terms) if (target.includes(term)) s += 1;
  return s;
}

export async function vectorSearch(_query: string, _filter: RAGFilter, _topK = 12) {
  // Placeholder for Atlas Vector Search version; returns empty list for now
  return [] as const;
}

