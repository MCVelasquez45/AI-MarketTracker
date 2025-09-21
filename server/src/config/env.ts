import 'dotenv/config';

const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3001),
  mongoUri: process.env.MONGO_URI ?? '',
  redisUrl: process.env.REDIS_URL ?? '',
  polygonApiKey: process.env.POLYGON_API_KEY ?? '',
  vllmBaseUrl: process.env.VLLM_BASE_URL ?? '',
  // Microservices (proweleu-brain) URLs
  ragUrl: process.env.RAG_URL ?? 'http://localhost:8001/retrieve',
  ragIndexUrl: process.env.RAG_INDEX_URL ?? 'http://localhost:8001/index',
  llmUrl: process.env.LLM_URL ?? 'http://localhost:8002/completion/stream',
  mcpUrl: process.env.MCP_URL ?? 'http://localhost:8003'
};

export default env;
