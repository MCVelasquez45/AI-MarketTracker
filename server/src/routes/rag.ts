import { Router } from 'express';
import { indexDocs, retrieveContext } from '../services/rag/retriever';

const router = Router();

router.post('/index', async (req, res) => {
  const { docs = [], chunk_size = 400 } = req.body ?? {};
  const result = await indexDocs(docs, chunk_size);
  res.json(result);
});

router.post('/retrieve', async (req, res) => {
  const { query = '', top_k = 6 } = req.body ?? {};
  const result = await retrieveContext(query, top_k);
  res.json(result);
});

export default router;

