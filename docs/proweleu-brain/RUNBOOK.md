# proweleu-brain — Runbook

## Prerequisites
- MongoDB running (local or Atlas). For local dev: `MONGODB_URI=mongodb://127.0.0.1:27017`
- Redis running for MCP cache: `REDIS_URL=redis://127.0.0.1:6379`

Quick start Redis (choose one):
- Homebrew (macOS):
  - `brew install redis`
  - `brew services start redis`
  - Verify: `redis-cli ping` → `PONG`
- Docker:
  - `docker run -d --name redis -p 6379:6379 redis:7`
  - Verify: `docker logs redis` and `redis-cli -h 127.0.0.1 ping`
Note: If Redis is not running, the MCP service now falls back to an in-memory TTL cache automatically.
- Python 3.10+ and Node 18+

## Environment setup
1) Copy `proweleu-brain/ops/.env.example` into each app dir as `.env`.
2) Set `MONGODB_URI`, `MONGO_APP_DB`, `MONGO_AI_DB`, `REDIS_URL`.
3) Optional: set `OPENAI_API_KEY` and `LLM_PROVIDER=openai` to use OpenAI; omit for stub stream.

## Start services (4 terminals)
1) RAG service (8001):
```
cd proweleu-brain/apps/rag-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```
2) LLM service (8002):
```
cd proweleu-brain/apps/llm-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```
3) MCP Polygon (8003):
```
cd proweleu-brain/apps/mcp-polygon
npm install
node index.js
```
4) API Gateway (8080):
```
cd proweleu-brain/apps/api-gateway
npm install
node index.js
```

## Verify with curl
- Health:
```
curl -s http://localhost:8080/healthz
```
- Index sample docs:
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
- Retrieve:
```
curl -s -X POST http://localhost:8001/retrieve \
 -H "content-type: application/json" \
 -d '{"query":"0DTE rules delta 12-20 and event day risk","top_k":6}' | jq
```
- MCP indicators (cached):
```
curl -s -X POST http://localhost:8003/tool/get_indicators \
 -H "content-type: application/json" \
 -d '{"ticker":"SPX"}' | jq
```
- Full recommendation (SSE):
```
curl -N -X POST http://localhost:8080/recommendation \
 -H "content-type: application/json" \
 -d '{"message":"Today’s 0DTE plan for SPX with delta 12–20 if no macro risk","prefetch":true}'
```

## Troubleshooting
- Gateway fails to start: check `MONGODB_URI` and network to Mongo.
- LLM returns stub only: set `OPENAI_API_KEY` and `LLM_PROVIDER=openai`.
- Empty RAG context: run the indexing curl to seed documents before retrieval.
- MCP endpoints 4xx: ensure Redis is reachable and POLYGON key is set once real calls are enabled.

## Index knowledge docs (strategy)
You can index all knowledge markdown files (e.g., Zero-DTE strategy) into RAG:

```
node proweleu-brain/tools/index-knowledge.mjs
```

Then test retrieval:

```
curl -s -X POST http://localhost:8001/retrieve \
 -H "content-type: application/json" \
 -d '{"query":"zero dte 12-20 delta macro gate and monitoring","top_k":6}' | jq
```

## Batch ingest (module + CLI + API)
You can ingest a folder of `.md`/`.txt` files using the built-in CLI:

```
cd proweleu-brain/apps/rag-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python ingest_folder.py --root ../../docs/proweleu-brain/knowledge --tags 0DTE rules spx
```

Or via the FastAPI endpoint:

```
curl -s -X POST http://127.0.0.1:8001/ingest \
 -H "content-type: application/json" \
 -d '{
  "docs":[
    {"doc_id":"zero-dte-strategy.md","text":"'"'"$(cat docs/proweleu-brain/knowledge/zero-dte-strategy.md)'"'"","tags":["0DTE","rules"]}
  ]
}' | jq
```

## Makefile helpers
Inside `apps/rag-service` you can use convenient make targets:

```
cd proweleu-brain/apps/rag-service
make rag-up                    # boots FastAPI on :8001 (installs deps if needed)
make embed DOCS=../../docs/proweleu-brain/knowledge  # batch-embed knowledge files
make search                    # quick retrieval sanity check
```

## Atlas Vector Search index (chunks/vector)
Ensure your Atlas index matches the stored vector field and dims:

```
DB: ai_db
Collection: chunks
Index name: chunks_idx

{
  "mappings": {
    "dynamic": true,
    "fields": {
      "vector": {
        "type": "knnVector",
        "dimensions": 384,
        "similarity": "cosine"
      }
    }
  }
}
```

Environment variables (already supported):

```
MONGODB_URI=...
MONGO_AI_DB=ai_db
RAG_COLL_NAME=chunks
RAG_VECTOR_FIELD=vector
AI_VECTOR_INDEX_NAME=chunks_idx
AI_VECTOR_DIM=384
```
