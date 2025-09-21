import { PolygonInfoPage } from './pages/PolygonInfoPage';

export default function App() {
  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <span className="logo">
            {/* Simple placeholder logo shape (not the official mark) */}
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 8l5-3 5 3v6l-5 3-5-3V8z" fill="#8247e5" />
            </svg>
          </span>
          <span className="title">AI-MarketTracker</span>
        </div>
        <nav className="nav">
          <a href="#polygon">Polygon</a>
          <a href="#docs" target="_blank" rel="noreferrer" href-lang="en" aria-label="Docs">Docs</a>
        </nav>
      </header>

      <main>
        <PolygonInfoPage />
      </main>
    </div>
  );
}

