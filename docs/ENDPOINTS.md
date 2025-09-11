# API Endpoints (Curl-Friendly)

Base URL: `http://localhost:3001`

## Health
- GET `/health`

Example:
```
curl -s http://localhost:3001/health | jq
```

## Sample Recommendation
- GET `/api/trades/recommendation`

Example:
```
curl -s http://localhost:3001/api/trades/recommendation | jq
```

## Server-Sent Events (SSE)
- GET `/api/sse/stream`

Example (stream):
```
curl -N http://localhost:3001/api/sse/stream
```

Notes
- Recommendation response respects the JSON shape in `AGENTS.md §5.1`.
- Real data integrations (Polygon MCP/REST, Mongo, vLLM) are scaffolded and will be wired next.

