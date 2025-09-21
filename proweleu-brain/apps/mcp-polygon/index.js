import express from "express";
import fetch from "node-fetch";
import Redis from "ioredis";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Resilient cache: prefer Redis; fall back to in-memory TTL if Redis unavailable
let redis = null;
let redisHealthy = false;
const useMemoryFallback = !process.env.REDIS_URL;
const mem = new Map(); // key -> { val, exp }

function mget(key) {
  const ent = mem.get(key);
  if (!ent) return null;
  if (Date.now() > ent.exp) {
    mem.delete(key);
    return null;
  }
  return ent.val;
}

function msetex(key, ttlSec, val) {
  mem.set(key, { val, exp: Date.now() + ttlSec * 1000 });
}

if (!useMemoryFallback) {
  try {
    redis = new Redis(process.env.REDIS_URL);
    redis.on("ready", () => {
      redisHealthy = true;
      console.log("mcp-polygon: Redis connected");
    });
    redis.on("error", (err) => {
      redisHealthy = false;
      console.warn("mcp-polygon: Redis error, using in-memory cache:", err.message);
    });
  } catch (e) {
    console.warn("mcp-polygon: Failed to init Redis, using in-memory cache:", e.message);
  }
} else {
  console.warn("mcp-polygon: REDIS_URL not set; using in-memory cache");
}

app.post("/tool/get_indicators", async (req, res) => {
  const { ticker } = req.body || {};
  if (!ticker) return res.status(400).json({ error: "ticker_required" });
  const key = `ind:${ticker}`;

  // Try Redis, then in-memory
  if (redis && redisHealthy) {
    try {
      const hit = await redis.get(key);
      if (hit) return res.json(JSON.parse(hit));
    } catch (e) {
      console.warn("mcp-polygon: Redis get failed; falling back to memory:", e.message);
    }
  } else {
    const hitMem = mget(key);
    if (hitMem) return res.json(hitMem);
  }

  // TODO: replace with real Polygon calls; shape stays stable
  const normalized = { ticker, RSI_14: 63.8, MACD: { line: 1.42, signal: 1.10, hist: 0.32 }, VWAP: 5499 };
  if (redis && redisHealthy) {
    try {
      await redis.setex(key, 15, JSON.stringify(normalized));
    } catch (e) {
      console.warn("mcp-polygon: Redis setex failed; storing in memory:", e.message);
      msetex(key, 15, normalized);
    }
  } else {
    msetex(key, 15, normalized);
  }
  res.json(normalized);
});

app.post("/tool/get_price", async (req, res) => {
  const { ticker } = req.body || {};
  if (!ticker) return res.status(400).json({ error: "ticker_required" });
  res.json({ ticker, price: 5520.12, ts: Date.now() });
});

const PORT = process.env.PORT || 8003;
app.listen(PORT, () => console.log("mcp-polygon on :" + PORT));
