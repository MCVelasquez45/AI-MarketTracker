# proweleu-brain

Backend-first scaffold for a multi-service "brain" stack: API Gateway (Node/Express), MCP Polygon tools (Node/Express + Redis), RAG Service (FastAPI + Mongo/Atlas Vector), and LLM Service (FastAPI, OpenAI fallback). Minimal REST/SSE endpoints for quick curl verification.

## Monorepo layout

```
proweleu-brain/
├─ apps/
│  ├─ api-gateway/        # Node/Express REST + SSE
│  ├─ mcp-polygon/        # Node/Express tools → Polygon + Redis cache
│  ├─ rag-service/        # Python FastAPI: /index, /retrieve (Atlas Vector Search)
│  └─ llm-service/        # Python FastAPI: /completion/stream (OpenAI fallback)
├─ ops/
│  └─ .env.example
└─ README.md
```

## Common env

Copy `ops/.env.example` to each service as `.env` and update values.

```
# Mongo
MONGODB_URI=mongodb+srv://USER:PASS@CLUSTER/?retryWrites=true&w=majority
MONGO_APP_DB=app_db
MONGO_AI_DB=ai_db

# Atlas Vector Search (if using all-MiniLM-L6-v2)
AI_VECTOR_INDEX_NAME=rag_chunks_idx
AI_VECTOR_DIM=384

# Redis + Polygon MCP
REDIS_URL=redis://127.0.0.1:6379
POLYGON_API_KEY=pk_xxx

# LLM
OPENAI_API_KEY=sk_xxx
LLM_PROVIDER=openai   # openai | local

# Internal services for api-gateway
RAG_URL=http://localhost:8001/retrieve
LLM_URL=http://localhost:8002/completion/stream
MCP_URL=http://localhost:8003
```

## Services

### 1) api-gateway (Node/Express)

Install deps:

```
cd apps/api-gateway
npm install
```

Run:

```
node index.js
```

### 2) mcp-polygon (Node/Express)

Install deps:

```
cd apps/mcp-polygon
npm install
```

Run:

```
node index.js
```

### 3) rag-service (Python/FastAPI)

Create venv and install:

```
cd apps/rag-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

Run:

```
uvicorn main:app --reload --port 8001
```

### 4) llm-service (Python/FastAPI)

Create venv and install:

```
cd apps/llm-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

Run:

```
uvicorn main:app --reload --port 8002
```

## Quick curl checks

health:

```
curl -s http://localhost:8080/healthz
```

index 3 docs:

```
curl -s -X POST http://localhost:8001/index \
 -H "content-type: application/json" \
 -d '{
  "docs":[
    {"doc_id":"zero-dte.md","text":"Only sell 0DTE options between 12–20 delta. Max size 5%."},
    {"doc_id":"risk.md","text":"Stand down on FOMC/CPI days unless hedged."},
    {"doc_id":"checklist.md","text":"Verify RSI, MACD, VWAP before entries."}
  ],
  "chunk_size": 400
}'
```

retrieve:

```
curl -s -X POST http://localhost:8001/retrieve \
 -H "content-type: application/json" \
 -d '{"query":"0DTE rules delta 12-20 and event day risk","top_k":6}' | jq
```

mcp indicators (cached):

```
curl -s -X POST http://localhost:8003/tool/get_indicators \
 -H "content-type: application/json" \
 -d '{"ticker":"SPX"}' | jq
```

full recommendation (SSE):

```
curl -N -X POST http://localhost:8080/recommendation \
 -H "content-type: application/json" \
 -d '{"message":"Today’s 0DTE plan for SPX with delta 12–20 if no macro risk","prefetch":true}'
```

record outcome:

```
curl -s -X POST http://localhost:8080/outcome \
 -H "content-type: application/json" \
 -d '{"recId":"<PASTE_RECOMMENDATION__ID>","outcome":"WIN","pnl":85,"notes":"expired worthless"}'
```

## Notes

- Keep Polygon key only in mcp-polygon. Frontend never touches it.
- Swap naive cosine loop in RAG with Atlas `$vectorSearch` once your index exists on `ai_db.chunks.vector`.
- Default OpenAI provider for quality; falls back to local stub if no key.
- Add Ajv JSON validation + rule gates (delta 0.12–0.20, size ≤ 5%) in api-gateway once streaming parse lands.

