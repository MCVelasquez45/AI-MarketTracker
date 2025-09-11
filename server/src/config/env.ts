import 'dotenv/config';

const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3001),
  mongoUri: process.env.MONGO_URI ?? '',
  redisUrl: process.env.REDIS_URL ?? '',
  polygonApiKey: process.env.POLYGON_API_KEY ?? '',
  vllmBaseUrl: process.env.VLLM_BASE_URL ?? ''
};

export default env;

