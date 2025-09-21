import { Request, Response } from 'express';
import { OutcomeModel } from '../models/Outcome';
import { RecommendationModel } from '../models/Recommendation';
import logger from '../config/logger';

export async function createOutcome(req: Request, res: Response) {
  try {
    const doc = await OutcomeModel.create(req.body);
    return res.json(doc);
  } catch (err) {
    logger.error({ err }, 'Failed to create outcome');
    return res.status(400).json({ error: 'invalid_outcome', details: String(err) });
  }
}

export async function createRecommendation(req: Request, res: Response) {
  try {
    const doc = await RecommendationModel.create(req.body);
    return res.json(doc);
  } catch (err) {
    logger.error({ err }, 'Failed to create recommendation');
    return res.status(400).json({ error: 'invalid_recommendation', details: String(err) });
  }
}

// SSE stub that streams a JSON block then a short summary
export async function streamRecommendation(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const jsonBlock = {
    ticker: 'SPX',
    strategy: 'zero_dte_credit_spread',
    bias: 'neutral',
    window: { startET: '13:30', endET: '16:00' },
    spread: {
      type: 'put_credit',
      short_leg: { option: 'O:SPX250921P05500000', delta: 0.18 },
      long_leg: { option: 'O:SPX250921P05450000', delta: 0.1 },
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

  res.write(`data: ${JSON.stringify(jsonBlock)}\n\n`);
  res.write(
    `data: ${JSON.stringify('Rationale: Neutral day; Δ≈0.18 put credit spread favored.')}\n\n`
  );
  res.write('data: [DONE]\n\n');
  res.end();
}

