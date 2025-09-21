# proweleu-brain — Architecture

## Components
- `api-gateway` (Node/Express): Orchestrates RAG → MCP → LLM; exposes REST/SSE; writes to Mongo app_db.
- `rag-service` (FastAPI): Embeds text with all-MiniLM-L6-v2; retrieves via naive cosine now, Atlas `$vectorSearch` later.
- `llm-service` (FastAPI): Streams completions via OpenAI Chat API; stub fallback when key missing.
- `mcp-polygon` (Node/Express): Thin tool server; caches results in Redis; safe to expose only to backend peers.

## Request → Response path
1) Client calls `POST /recommendation` on api-gateway (SSE).
2) Gateway → RAG `/retrieve` for context and citations.
3) Gateway (optional) → MCP `/tool/get_indicators` for RSI/MACD/VWAP.
4) Gateway → LLM `/completion/stream` with messages + RAG context + toolResults.
5) Stream tokens back to client; persist recommendation and later outcomes.

## Data
- Mongo app_db: recommendations, outcomes (Mongoose models in gateway).
- Mongo ai_db: `chunks` collection with `{doc_id, chunk_id, text, vector, meta}`.
- Redis: short TTL cache (e.g., `ind:SPX` for indicators).

## Atlas Vector Search (swap-in plan)
Create an index on `ai_db.chunks.vector` and replace naive retrieval with:
```
db.chunks.aggregate([
  {
    $vectorSearch: {
      index: "rag_chunks_idx",
      path: "vector",
      numCandidates: 200,
      limit: 12,
      queryVector: <embeddingArray>
    }
  },
  { $project: { doc_id: 1, chunk_id: 1, text: 1, _id: 0 } }
])
```

## Security & Keys
- Keep `POLYGON_API_KEY` only in `mcp-polygon` service.
- Never expose MCP endpoints directly to the browser; gateway-to-MCP only.
- Use `.env` files; do not commit secrets.

