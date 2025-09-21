# Zero-DTE Options Selling Strategy — Detailed Steps

Guiding Principle
- Sell 0DTE, out-of-the-money (OTM) options targeting ≈70–80% probability of expiring worthless.
- Focus on 20 → 12 delta for short legs; widen buffer on event/volatile days; enforce risk caps.

Step 1 — Macro/Event Check
- Review Fed speeches, FOMC, CPI/PCE, and other high-volatility events.
- If no major events: proceed normally.
- If major events: expect higher IV; widen OTM or reduce size, or stand down.

Step 2 — Market Context (Information Radar)
- Market-cap leaders: MSFT, AAPL, NVDA, GOOGL, AMZN, META, TSLA signal market beta.
- Risk-on ETFs: XLK, XLF, XLY, XLI, XLB, SMH, ARKK; green breadth supports bullish bias.
- Defensive ETFs: XLV, XLP, XLU, XLRE, XLC; leadership implies caution.
- Internals: A/D line, RSI, momentum to confirm bullish / bearish / neutral.

Step 3 — SPX Range Framing (Trade Window ≈ last 2 hours)
- Time window: 1:30–2:00 PM ET into close to maximize theta.
- On 15m SPX: mark day high/low, compute midpoint, identify support/resistance; include VPOC if available.
- Strike selection: choose OTM options with delta 20 → 12.
  - Bullish/neutral: sell put credit spread (short put + lower long put).
  - Bearish: sell call credit spread (short call + higher long call).
- Premium targeting: if late-day premium is light, adjust contract count within risk caps.

Step 4 — Monitor to Expiry
- Keep a news feed open; track tick speed; watch 1m/5m/15m charts.
- Monitor RSI/TRIX, A/D line, and delta drift on chosen strikes.
- Risk rule: if price approaches strikes or breaks key levels, reduce risk or exit.
- If safe into close: allow to expire to collect credit (avoid extra day trades).

Summary
- A four-step loop: macro gate → information radar → SPX range framing → active monitoring. Execute with risk limits and OTM buffers targeting Δ≈0.12–0.20.

References
- SPX index data via Polygon Indices (`I:SPX`).
- Options chain via Polygon Options API; options ticker format: O:SPX<YYMMDD><C|P><strike*1000>.
- Sample indices listing (SPX included):
  ```bash
  curl "https://api.polygon.io/v3/reference/tickers?market=indices&active=true&limit=1000&apiKey=YOUR_API_KEY"
  ```
