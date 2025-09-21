import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGO_APP_DB });

const RecSchema = new mongoose.Schema({
  sessionDate: String,
  ticker: String,
  strategy: String,
  deltaTarget: Number,
  expiry: String,
  indicators: Object,
  docs: [String],
  confidence: Number,
  status: { type: String, default: "OPEN" },
  rationale: String
}, { timestamps: true });

const OutcomeSchema = new mongoose.Schema({
  recId: mongoose.Schema.Types.ObjectId,
  pnl: Number,
  outcome: String,
  notes: String
}, { timestamps: true });

const Recommendation = mongoose.model("Recommendation", RecSchema);
const Outcome = mongoose.model("Outcome", OutcomeSchema);

app.get("/healthz", (req, res) => res.json({ ok: true }));

app.post("/recommendation", async (req, res) => {
  const { message = "0DTE plan for SPX", prefetch = true } = req.body || {};

  // 1) RAG
  const rag = await fetch(process.env.RAG_URL || "http://localhost:8001/retrieve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: message, top_k: 6 })
  }).then(r => r.json()).catch(() => ({ context: "", citations: [] }));

  // 2) Optional MCP prefetch
  let toolResults = {};
  if (prefetch) {
    try {
      toolResults.indicators = await fetch((process.env.MCP_URL || "http://localhost:8003") + "/tool/get_indicators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: "SPX" })
      }).then(r => r.json());
    } catch (e) {
      toolResults.indicators = { error: "mcp_unavailable" };
    }
  }

  // 3) SSE proxy to LLM
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.flushHeaders();

  const llm = await fetch(process.env.LLM_URL || "http://localhost:8002/completion/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: "Rules > Docs > Data. Never place orders. Max 5% size." },
        { role: "system", content: `<<<RAG_CONTEXT>>>\n${rag.context || ""}\n<<<END_RAG_CONTEXT>>>` },
        { role: "user", content: message }
      ],
      toolResults
    })
  }).catch(() => null);

  if (!llm || !llm.body) {
    res.write("data: {\"error\":\"llm_unavailable\"}\n\n");
    res.end();
    return;
  }

  llm.body.on("data", chunk => res.write(chunk));
  llm.body.on("end", async () => res.end());
  llm.body.on("error", () => {
    res.write("data: {\"error\":\"llm_stream_error\"}\n\n");
    res.end();
  });
});

app.post("/outcome", async (req, res) => {
  const doc = await Outcome.create(req.body || {});
  res.json(doc);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("api-gateway on :" + PORT));

