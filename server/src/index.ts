import express from 'express';
import pinoHttp from 'pino-http';
import cors from 'cors';
import env from './config/env';
import logger from './config/logger';

import healthRoute from './routes/health';
import tradesRoute from './routes/trades';
import sseRoute from './routes/sse';

const app = express();
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.use('/health', healthRoute);
app.use('/api/trades', tradesRoute);
app.use('/api/sse', sseRoute);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

app.listen(env.port, () => {
  logger.info({ port: env.port }, 'Server listening');
});

