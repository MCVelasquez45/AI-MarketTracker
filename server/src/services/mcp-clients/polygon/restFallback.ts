// Placeholder REST fallback for Polygon endpoints
export async function polygonRestGet(_path: string, _query: Record<string, string>) {
  // TODO: Implement HTTP calls with retries when network is allowed
  return { ok: false, error: 'REST fallback not implemented in scaffolding' } as const;
}

