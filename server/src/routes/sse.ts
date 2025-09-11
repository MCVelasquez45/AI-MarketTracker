import { Router } from 'express';

const router = Router();

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (data: unknown) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  send({ status: 'connected', time: new Date().toISOString() });

  const interval = setInterval(() => {
    send({ heartbeat: true, time: new Date().toISOString() });
  }, 10000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

export default router;

