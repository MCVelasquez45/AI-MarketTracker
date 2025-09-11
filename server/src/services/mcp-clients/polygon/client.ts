// Placeholder MCP client for Polygon MCP server
export type PolygonMcpRequest = { tool: string; params?: Record<string, unknown> };

export async function callPolygonMcp(_req: PolygonMcpRequest) {
  // TODO: Integrate with Polygon MCP tools when available in runtime
  // For now, return a placeholder to keep compile-time happy
  return { ok: false, error: 'MCP not wired in scaffolding' } as const;
}

