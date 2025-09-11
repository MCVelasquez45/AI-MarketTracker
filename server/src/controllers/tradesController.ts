import { Request, Response } from 'express';
import { RecommendationSchema, type Recommendation } from '../types/schemas';

export const getSampleRecommendation = (_req: Request, res: Response) => {
  const sample: Recommendation = {
    ticker: 'SPX',
    strategy: 'zero_dte_credit_spread',
    bias: 'neutral',
    window: { startET: '13:30', endET: '16:00' },
    spread: {
      type: 'put_credit',
      short_leg: { option: 'O:SPX250911P05050000', delta: 0.18 },
      long_leg: { option: 'O:SPX250911P05000000', delta: 0.1 },
      width: 5
    },
    sizing: { contracts: 2, per_contract_credit: 0.65, est_max_loss: 435.0 },
    risk: { stop_rule: 'breach_midpoint_or_SR', event_risk: 'none' },
    context: {
      leaders: { green: ['MSFT', 'NVDA'], red: ['AAPL'] },
      risk_on_etfs: { green_count: 5, tickers: ['XLK', 'SMH', 'XLF'] },
      defensive_etfs: { leading: false },
      internals: { ad_line: 'positive', rsi_15m: 54 }
    },
    notes: 'Late-day theta favorable; choose 20→12 delta OTM; widen if IV high.'
  };

  const parsed = RecommendationSchema.safeParse(sample);
  if (!parsed.success) {
    return res.status(500).json({ error: 'Schema validation failed', details: parsed.error.flatten() });
  }

  return res.json(sample);
};

