export function PolygonInfoPage() {
  return (
    <section id="polygon" className="card">
      <header className="card-header">
        <div className="logo-wrap" aria-hidden>
          <svg width="28" height="28" viewBox="0 0 24 24">
            <path d="M7 8l5-3 5 3v6l-5 3-5-3V8z" fill="#8247e5" />
          </svg>
        </div>
        <div>
          <h1 className="card-title">Polygon ChatGPT Plugin</h1>
          <p className="muted">Announced Jun 3, 2023 • Free to use</p>
        </div>
      </header>

      <p>
        The Polygon plugin for ChatGPT lets you explore tickers, prices, options, and financials from
        Polygon.io directly within ChatGPT conversations. It’s powerful for quick research and discovery.
      </p>

      <h2>Highlights</h2>
      <ul>
        <li>Search tickers across stocks, forex, and crypto</li>
        <li>Check current prices and historical context</li>
        <li>Retrieve options contracts and details by symbol</li>
        <li>Discover supported exchanges and market coverage</li>
        <li>Access financial statements for supported tickers</li>
      </ul>

      <h2>Install (in ChatGPT)</h2>
      <ol>
        <li>Open ChatGPT, go to the plugin dropdown</li>
        <li>Search “Polygon” and click Install</li>
        <li>Start asking finance questions with live market data</li>
      </ol>

      <h2>Example Prompts</h2>
      <div className="examples">
        <div className="example">
          <div className="example-title">Search for tickers</div>
          <code>Find the stock tickers for Tesla, Apple, and Amazon.</code>
        </div>
        <div className="example">
          <div className="example-title">Current prices</div>
          <code>What are the current prices for TSLA, AAPL, and AMZN?</code>
        </div>
        <div className="example">
          <div className="example-title">Options contracts</div>
          <code>List TSLA options expiring on 2023-06-02.</code>
        </div>
        <div className="example">
          <div className="example-title">Contract details</div>
          <code>Show details for O:TSLA230602C00060000.</code>
        </div>
      </div>

      <p className="note">
        Note: Large responses may be truncated in ChatGPT, and LLMs can sometimes hallucinate. Always verify
        data for trading decisions.
      </p>

      <a className="button" href="https://polygon.io/blog/announcing-the-polygon-chatgpt-plugin" target="_blank" rel="noreferrer">
        Read the announcement
      </a>
    </section>
  );
}

