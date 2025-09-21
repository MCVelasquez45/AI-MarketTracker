import { Router } from 'express';
import env from '../config/env';
import type { Request, Response } from 'express';
// For Node.js v18+, use the global fetch API
// import fetch from 'node-fetch';

const router = Router();

// Health endpoint aligned with api-gateway
router.get('/healthz', (_req, res) => res.json({ ok: true }));

// Recommendation SSE orchestrator (RAG → MCP → LLM stream)
router.post('/recommendation', async (req: Request, res: Response) => {
  const { message = '0DTE plan for SPX', prefetch = true } = (req.body ?? {}) as {
    message?: string;
    prefetch?: boolean;
  };

  // 1) RAG retrieve
  let rag: any = { context: '', citations: [] };
  try {
    const r = await fetch(env.ragUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: message, top_k: 6 })
    });
    rag = await r.json();
  } catch {
    rag = { context: '', citations: [] };
  }

  // 2) Optional MCP prefetch
  const toolResults: Record<string, unknown> = {};
  if (prefetch) {
    try {
      const r = await fetch(`${env.mcpUrl}/tool/get_indicators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: 'SPX' })
      });
      toolResults.indicators = await r.json();
    } catch {
      toolResults.indicators = { error: 'mcp_unavailable' };
    }
  }

  // 3) Proxy SSE from LLM service
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let llmResp: any;
  try {
    llmResp = await fetch(env.llmUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Rules > Docs > Data. Never place orders. Max 5% size.' },
          { role: 'system', content: `<<<RAG_CONTEXT>>>\n${rag.context || ''}\n<<<END_RAG_CONTEXT>>>` },
          { role: 'user', content: message }
        ],
        toolResults
      })
    });
  } catch (e) {
    res.write(`data: ${JSON.stringify({ error: 'llm_unavailable', details: String(e) })}\n\n`);
    res.end();
    return;
  }

  if (!llmResp?.body) {
    res.write('data: {"error":"llm_no_body"}\n\n');
    res.end();
    return;
  }

  // node-fetch yields a Node.js readable stream
  llmResp.body.on('data', (chunk: Buffer) => res.write(chunk));
  llmResp.body.on('end', () => res.end());
  llmResp.body.on('error', () => {
    res.write('data: {"error":"llm_stream_error"}\n\n');
    res.end();
  });
});

// Outcome storage can be handled by existing /api/recommendations/outcome,
// but expose a simple passthrough here for alignment.
router.post('/outcome', async (req: Request, res: Response) => {
  try {
    // Reuse existing monolith endpoint for persistence if desired
    // Otherwise, save directly once models are wired in this route
    res.redirect(307, '/api/recommendations/outcome');
  } catch (e) {
    res.status(400).json({ error: 'invalid_outcome', details: String(e) });
  }
});

export default router;

