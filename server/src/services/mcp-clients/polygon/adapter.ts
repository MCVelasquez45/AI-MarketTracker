// Normalization adapter to convert Polygon responses to internal DTOs
export type NormalizedQuote = { ticker: string; price: number; time: string };

export function normalizeQuote(_raw: unknown): NormalizedQuote | null {
  // TODO: implement once real payload shapes are defined
  return null;
}

