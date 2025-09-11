import { z } from 'zod';

export const RecommendationSchema = z.object({
  ticker: z.literal('SPX'),
  strategy: z.literal('zero_dte_credit_spread'),
  bias: z.union([z.literal('bullish'), z.literal('bearish'), z.literal('neutral')]),
  window: z.object({ startET: z.string(), endET: z.string() }),
  spread: z.object({
    type: z.union([z.literal('put_credit'), z.literal('call_credit')]),
    short_leg: z.object({ option: z.string(), delta: z.number() }),
    long_leg: z.object({ option: z.string(), delta: z.number() }),
    width: z.number()
  }),
  sizing: z.object({
    contracts: z.number(),
    per_contract_credit: z.number(),
    est_max_loss: z.number()
  }),
  risk: z.object({ stop_rule: z.string(), event_risk: z.union([z.literal('none'), z.literal('elevated')]) }),
  context: z.object({
    leaders: z.object({ green: z.array(z.string()), red: z.array(z.string()) }),
    risk_on_etfs: z.object({ green_count: z.number(), tickers: z.array(z.string()) }),
    defensive_etfs: z.object({ leading: z.boolean() }),
    internals: z.object({ ad_line: z.string(), rsi_15m: z.number() })
  }),
  notes: z.string()
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

