import express from "express";
import fetch from "node-fetch";
import Redis from "ioredis";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const redis = new Redis(process.env.REDIS_URL);

app.post("/tool/get_indicators", async (req, res) => {
  const { ticker } = req.body || {};
  if (!ticker) return res.status(400).json({ error: "ticker_required" });
  const key = `ind:${ticker}`;
  const hit = await redis.get(key);
  if (hit) return res.json(JSON.parse(hit));

  // TODO: replace with real Polygon calls; shape stays stable
  const normalized = { ticker, RSI_14: 63.8, MACD: { line: 1.42, signal: 1.10, hist: 0.32 }, VWAP: 5499 };
  await redis.setex(key, 15, JSON.stringify(normalized));
  res.json(normalized);
});

app.post("/tool/get_price", async (req, res) => {
  const { ticker } = req.body || {};
  if (!ticker) return res.status(400).json({ error: "ticker_required" });
  res.json({ ticker, price: 5520.12, ts: Date.now() });
});

const PORT = process.env.PORT || 8003;
app.listen(PORT, () => console.log("mcp-polygon on :" + PORT));

