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
⸻

🤝 Contributing

Contributions are welcome! Please open an issue or pull request for discussion.
As new endpoints and data sources (e.g., CapitolTrades, sentiment, macro) are added, this README.md will be updated to reflect the architecture.

⸻

📜 License

MIT


Would you like me to also generate a **matching `ARCHITECTURE.md`** in `/docs` that expands the diagram (services, feedback loop, data flow) so you don’t clutter the main README but still keep hedge-fund-level detail?
