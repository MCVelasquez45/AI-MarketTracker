import { Router } from 'express';
import { createOutcome, createRecommendation, streamRecommendation } from '../controllers/recommendationsController';

const router = Router();

// Persist a recommendation document
router.post('/', createRecommendation);

// Stream a recommendation (SSE stub)
router.post('/stream', streamRecommendation);

// Record an outcome linked to a recommendation
router.post('/outcome', createOutcome);

export default router;

