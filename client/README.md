# Client Scaffold

This folder now contains a minimal React + Vite app with a Polygon info page and a header including a Polygon logo placeholder.

Quick start
1) `npm install`
2) `cp .env.example .env` (optional; `VITE_API_BASE` is used by services when added)
3) `npm run dev` (or `npm run build && npm run preview`)

Pages
- Polygon Info (default): Highlights the Polygon ChatGPT plugin with install steps and example prompts.

Notes
- The logo is a simple placeholder SVG (not the official mark). Replace with an approved asset in `src/App.tsx` or add `src/assets/polygon.svg` and an image tag.
- Backend base URL can be set via `VITE_API_BASE` in `.env`.
