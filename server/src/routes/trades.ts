import { Router } from 'express';
import { getSampleRecommendation } from '../controllers/tradesController';

const router = Router();

// Sample recommendation for curl testing
router.get('/recommendation', getSampleRecommendation);

export default router;

