# proweleu-brain — Runbook

## Prerequisites
- MongoDB running (local or Atlas). For local dev: `MONGODB_URI=mongodb://127.0.0.1:27017`
- Redis running for MCP cache: `REDIS_URL=redis://127.0.0.1:6379`
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

