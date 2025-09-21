# AI-MarketTracker

AI-MarketTracker is a **hedge-fund–grade AI trading assistant** built on open-source LLMs, **MongoDB memory**, and **MCP servers** with Retrieval-Augmented Generation (RAG).  
It integrates **congressional trading activity**, **market sentiment**, and **macro events** (Polygon.io, CapitolTrades, Fed calendar) to generate intelligent trade recommendations, while learning from outcomes via a **feedback loop**.

---

## 🚀 Features (MVP)

- **LLM-driven trade analysis** powered by open-source models (Hugging Face, vLLM/TGI).
- **MCP server integration** for Polygon.io, CapitolTrades, sentiment feeds, and Fed calendar.
- **MongoDB Atlas Vector Search** for RAG over filings, trades, and sentiment.
- **Risk engine** for affordability, expiry windows, and position sizing.
- **Evaluator & feedback loop** to score recommendations and fine-tune models.
- **Modern frontend (React + Vite + TypeScript)** with live streaming of recommendations.
- **Backend (Node.js + Express + TypeScript)** orchestrating data pipelines, RAG, and LLM inference.

---

## 🏗️ Architecture Overview

[Frontend: React + Vite + TS]
|
[API Gateway / Express BFF]
|
[Orchestrator Service]
|       |       |
v       v       v
[MCP: Polygon]   [MCP: Congress]   [MCP: News/Sentiment]   [MCP: Fed Calendar]
|                |                |                      |
v––––––––v––––––––v–––––––––––v
[Feature Ingestion & ETL → MongoDB + Vector Search]
|
[RAG Retriever]
|
[LLM Router → vLLM/TGI]
|
[Evaluator & Feedback Loop]
|
[MongoDB (Memory)]

- **Frontend:** Live dashboards, recommendations stream, user interaction.
- **Backend Orchestrator:** Handles request → MCP fan-out → RAG → LLM → response.
- **MCP Servers:** Abstractions for Polygon, Congress (CapitolTrades), Sentiment, and Fed data.
- **MongoDB:** Trade recommendations, features, sentiment, evaluation results.
- **Feedback Loop:** Trade outcomes auto-evaluated and used for model fine-tuning.

---

## 📂 Directory Structure

### Frontend (`client/`)

client/
├─ .env.example
├─ index.html
├─ vite.config.ts
├─ tsconfig.json
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ router/                # Routes (Dashboard, Ideas, History, Settings)
│  ├─ pages/                 # Page-level components
│  ├─ components/            # UI, charts, layout
│  ├─ features/              # Trade & auth features
│  ├─ contexts/              # Auth, Theme contexts
│  ├─ services/              # API clients (axios, SSE)
│  ├─ types/                 # Shared DTOs
│  ├─ utils/                 # Helpers, formatters
│  └─ styles/                # Global styles
└─ tests/                    # Unit & e2e tests

### Backend (`server/`)

server/
├─ .env.example
├─ package.json
├─ tsconfig.json
├─ src/
│  ├─ server.ts              # Entry point
│  ├─ app.ts                 # Express wiring
│  ├─ config/                # Env, Mongo, Redis, telemetry
│  ├─ routes/                # API routes
│  ├─ controllers/           # Express controllers
│  ├─ services/
│  │  ├─ orchestrator/       # Main recommendation orchestration
│  │  ├─ risk-engine/        # Capital & expiry logic
│  │  ├─ evaluator/          # Trade scoring (ex-ante, ex-post)
│  │  ├─ rag/                # Retriever, embeddings, indexing
│  │  ├─ llm-router/         # Model routing, prompts
│  │  ├─ mcp-clients/        # MCP adapters (Polygon, Congress, News, Fed)
│  │  ├─ feature-store/      # RSI, MACD, VWAP computations
│  │  └─ cache/              # Redis caching
│  ├─ models/                # MongoDB schemas
│  ├─ middlewares/           # Auth, rate limiting, error handling
│  ├─ workers/               # ETL, cron jobs, indexers, fine-tune prep
│  ├─ utils/                 # Logging, retry, schema validation
│  └─ types/                 # Shared DTOs
└─ tests/                    # Unit & integration tests

---

## ✅ MVP Stack Checklist

### Core Infrastructure
- [x] **MongoDB Atlas** (primary DB + vector search)
- [x] **Redis** (caching & rate limits)
- [ ] **Kafka/Redpanda** (event bus for ingestion, eval, feedback)
- [x] **Open-source LLM** (Hugging Face, vLLM/TGI)
- [ ] **LoRA fine-tuning pipeline** (SFT/DPO with evaluator feedback)

### Data Sources (MCP servers)
- [x] Polygon.io MCP (options, stocks, greeks, IV, technicals)
- [ ] CapitolTrades MCP (congressional trading scraper/adapter)
- [ ] News & Sentiment MCP (feeds + transformer scoring)
- [ ] Fed Calendar MCP (macro events)

### Backend
- [x] Express API Gateway (TypeScript)
- [x] Orchestrator service
- [ ] Risk Engine (capital, expiry sizing)
- [ ] Evaluator (ex-ante and ex-post scoring)
- [ ] RAG Retriever (MongoDB Vector Search)
- [ ] Fine-tune prep workers

### Frontend
- [x] React + Vite + TS scaffold
- [ ] Live Recommendations page (SSE/WebSocket)
- [ ] Dashboard (watchlist + market data)
- [ ] History page (evaluated outcomes, PnL)
- [ ] Auth & settings pages

---

## 📖 Development

```bash
# Clone repo
git clone https://github.com/MCVelasquez45/AI-MarketTracker.git
cd AI-MarketTracker

# Install frontend
cd client && npm install && cd ..

# Install backend
cd server && npm install && cd ..

# Run backend
cd server && npm run dev

# Run frontend
cd client && npm run dev

```

### Microservices Backend (proweleu-brain) Quickstart

If you prefer a backend-first microservices flow, use the `proweleu-brain` stack (Gateway + RAG + LLM + MCP):

1) Copy envs: `cp proweleu-brain/ops/.env.example proweleu-brain/apps/<each-service>/.env` and fill values.
2) Start services in separate terminals:

```bash
# RAG service
cd proweleu-brain/apps/rag-service && python -m venv .venv && source .venv/bin/activate \
  && pip install -r requirements.txt && uvicorn main:app --reload --port 8001

# LLM service
cd proweleu-brain/apps/llm-service && python -m venv .venv && source .venv/bin/activate \
  && pip install -r requirements.txt && uvicorn main:app --reload --port 8002

# MCP tools (stub w/ Redis cache fallback)
cd proweleu-brain/apps/mcp-polygon && npm install && node index.js  # port 8003

# API Gateway
cd proweleu-brain/apps/api-gateway && npm install && node index.js  # port 8080
```

Quick curl checks:

```bash
# Health (gateway)
curl -s http://localhost:8080/healthz

# Index docs
curl -s -X POST http://localhost:8001/index -H 'content-type: application/json' -d '{
  "docs":[
    {"doc_id":"zero-dte.md","text":"Only sell 0DTE options between 12–20 delta. Max size 5%."},
    {"doc_id":"risk.md","text":"Stand down on FOMC/CPI days unless hedged."},
    {"doc_id":"checklist.md","text":"Verify RSI, MACD, VWAP before entries."}
  ],
  "chunk_size": 400
}'

# Retrieve
curl -s -X POST http://localhost:8001/retrieve -H 'content-type: application/json' \
  -d '{"query":"0DTE rules delta 12-20 and event risk","top_k":6}' | jq

# MCP tools
curl -s -X POST http://localhost:8003/tool/get_indicators -H 'content-type: application/json' -d '{"ticker":"SPX"}' | jq

# Recommendation (SSE)
curl -N -X POST http://localhost:8080/recommendation -H 'content-type: application/json' \
  -d '{"message":"Today’s 0DTE plan for SPX with delta 12–20 if no macro risk","prefetch":true}'
```

See also: `docs/proweleu-brain/RUNBOOK.md` and `docs/proweleu-brain/ARCHITECTURE.md`.

## Quick curl tests (backend)

- Health

```bash
curl -s http://localhost:3001/health | jq
```

- RAG: index sample docs

```bash
curl -s -X POST http://localhost:3001/api/rag/index \
 -H "content-type: application/json" \
 -d '{
  "docs":[
    {"doc_id":"zero-dte.md","text":"Only sell 0DTE options between 12–20 delta. Max size 5%."},
    {"doc_id":"risk.md","text":"Stand down on FOMC/CPI days unless hedged."},
    {"doc_id":"checklist.md","text":"Verify RSI, MACD, VWAP before entries."}
  ],
  "chunk_size": 400
}' | jq
```

- RAG: retrieve

```bash
curl -s -X POST http://localhost:3001/api/rag/retrieve \
 -H "content-type: application/json" \
 -d '{"query":"0DTE rules delta 12-20 and event risk","top_k":6}' | jq
```

- Recommendation (SSE stream stub)

```bash
curl -N -X POST http://localhost:3001/api/recommendations/stream \
 -H "content-type: application/json" \
 -d '{"message":"Today\'s 0DTE plan for SPX with delta 12–20 if no macro risk","prefetch":true}'
```

- Persist a recommendation

```bash
curl -s -X POST http://localhost:3001/api/recommendations \
 -H "content-type: application/json" \
 -d '{
  "sessionDate":"2025-09-21","ticker":"SPX","strategy":"0DTE_SELL_PUT",
  "deltaTarget":0.18,"expiry":"2025-09-21","indicators":{"RSI":63.8},
  "docs":["zero-dte.md#p2"],"confidence":0.64,"status":"OPEN","rationale":"short text"
}' | jq
```

- Record outcome

```bash
curl -s -X POST http://localhost:3001/api/recommendations/outcome \
 -H "content-type: application/json" \
 -d '{"recId":"<PASTE_ID>","outcome":"WIN","pnl":85,"notes":"expired worthless"}' | jq
```
⸻

🤝 Contributing

Contributions are welcome! Please open an issue or pull request for discussion.
As new endpoints and data sources (e.g., CapitolTrades, sentiment, macro) are added, this README.md will be updated to reflect the architecture.

⸻

📜 License

MIT

## Backend Architecture (Current Scaffold)

This section maps a typical MERN mental model to our current TypeScript backend and shows how requests flow end‑to‑end. For canonical rules and contracts, see `AGENTS.md`.

### MERN → Our Structure
- Models (Mongoose): `server/src/models/` (placeholder; to be added with `config/mongo.ts`).
- Controllers: `server/src/controllers/` (e.g., `tradesController.ts`).
- Routes: `server/src/routes/` (`health.ts`, `trades.ts`, `sse.ts`).
- Services/Utils split by responsibility:
  - External APIs: `server/src/services/mcp-clients/polygon/*` (MCP first; REST fallback).
  - Orchestrator: `server/src/services/orchestrator/` (compose data → output).
  - RAG/Search: `server/src/services/rag/retriever.ts` (Atlas Vector Search).
  - LLM: `server/src/services/llm-router/deepPath.ts` (vLLM/TGI path).
  - Risk/Features/Evaluator: stubs under `server/src/services/*`.
- Config/Infra: `server/src/config/` (`env.ts`, `logger.ts`; later: `mongo.ts`, `redis.ts`).
- Types/Schemas (DTOs): `server/src/types/schemas.ts` (Zod for strict API contracts).
- Entry point: `server/src/index.ts` (Express app, Pino logs, route mounts).

### Request Flow (Recommendation example)
1) Client calls `GET /api/trades/recommendation`.
2) Route (`routes/trades.ts`) forwards to controller.
3) Controller (`controllers/tradesController.ts`) validates response with Zod schema (`types/schemas.ts`).
4) Orchestrator (`services/orchestrator/`) would:
   - Fetch market/chain via `services/mcp-clients/polygon` (MCP server; REST fallback).
   - Pull context via `services/rag/retriever.ts`.
   - Use `services/llm-router/deepPath.ts` to produce JSON strictly matching §5.1 in `AGENTS.md`.
5) Return schema‑valid JSON to the client.

### Why Zod (in addition to Mongo schemas)
- Mongoose validates persistence; Zod validates API/LLM I/O and keeps contracts backward‑compatible, independent of the database layer.

### External Data: MCP vs REST
- MCP (preferred): tool server exposing Polygon APIs → `services/mcp-clients/polygon/client.ts`.
- REST fallback: direct HTTP for missing endpoints → `services/mcp-clients/polygon/restFallback.ts`.
- Adapter: normalize raw responses to internal DTOs → `services/mcp-clients/polygon/adapter.ts`.

### MongoDB placement
- OLTP models live in `server/src/models/*` (to be added).
- RAG uses Atlas Vector Search via `services/rag/retriever.ts` (separate from OLTP models).

### Logging & Errors
- Structured logs via Pino (`pino-http`) with ISO timestamps.
- Controllers validate outputs; services return typed results; propagate errors cleanly.

### Add a New Route (recipe)
1) Create a controller in `server/src/controllers/YourFeatureController.ts`.
2) Export handler(s) that return typed/validated JSON using Zod.
3) Add a route file in `server/src/routes/yourFeature.ts` and mount in `src/index.ts`:
   `app.use('/api/your-feature', yourFeatureRoute)`.

### Run & cURL
From repo root:

```
cd server && npm install && npm run dev

# Health
curl -s http://localhost:3001/health | jq

# Sample recommendation (matches AGENTS.md §5.1 shape)
curl -s http://localhost:3001/api/trades/recommendation | jq

# Server-Sent Events (heartbeat)
curl -N http://localhost:3001/api/sse/stream
```

For more, see `docs/ENDPOINTS.md`.

### Next Implementation Steps
- Wire Polygon MCP + REST fallback and normalization adapter.
- Implement orchestrator logic for SPX 20→12 delta candidate selection.
- Add RAG retriever (Atlas Vector Search) and vLLM deep path enforcing the JSON schema in `AGENTS.md §5.1`.
