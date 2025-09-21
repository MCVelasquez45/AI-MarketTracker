# proweleu-brain — Overview

Multi-service backend "brain" that powers orchestration, retrieval (RAG), tool use (Polygon MCP), and LLM generation behind a Node/Express API Gateway.

## Services
- api-gateway (Node/Express, :8080): REST + SSE, orchestrates RAG/MCP/LLM and saves records to Mongo.
- rag-service (FastAPI, :8001): /index for embeddings, /retrieve for similarity search (Atlas Vector ready).
- llm-service (FastAPI, :8002): /completion/stream, defaults to OpenAI, stubs if no key.
- mcp-polygon (Node/Express, :8003): /tool/* endpoints; wraps Polygon + Redis cache (stubbed now).

## Monorepo layout
```
proweleu-brain/
├─ apps/
│  ├─ api-gateway/
│  ├─ mcp-polygon/
│  ├─ rag-service/
│  └─ llm-service/
├─ ops/
│  └─ .env.example
└─ README.md
```

## Environment
Copy `ops/.env.example` into each app as `.env`, then set:
- `MONGODB_URI`, `MONGO_APP_DB`, `MONGO_AI_DB`
- `REDIS_URL`
- `AI_VECTOR_INDEX_NAME`, `AI_VECTOR_DIM` (384 for all-MiniLM-L6-v2)
- `OPENAI_API_KEY`, `LLM_PROVIDER=openai|local`
- Gateway-only: `RAG_URL`, `LLM_URL`, `MCP_URL`

## Endpoints
- api-gateway
  - `GET /healthz`
  - `POST /recommendation` → streams tokens (SSE)
  - `POST /outcome` → store ex-post label
- rag-service
  - `POST /index` → bulk index and embed
  - `POST /retrieve` → returns `{context, citations}`
- llm-service
  - `POST /completion/stream` → SSE stream
- mcp-polygon
  - `POST /tool/get_indicators` → indicators (cached)
  - `POST /tool/get_price` → price stub

## Data flow (summary)
1) api-gateway calls rag-service /retrieve to build compact context.
2) Optionally prefetch MCP indicators via mcp-polygon (Redis caches 15s).
3) api-gateway calls llm-service /completion/stream with messages + context + toolResults.
4) Gateway streams output to client and writes records to Mongo.

## Notes
- Keep Polygon API key only in mcp-polygon. Gateway/Frontend never see it.
- Replace naive cosine in rag-service with Atlas `$vectorSearch` once your index is created.
- llm-service falls back to a deterministic stub if no `OPENAI_API_KEY`.

