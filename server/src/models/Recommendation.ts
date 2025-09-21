import mongoose, { Schema, Document, Model } from 'mongoose';

export interface RecommendationDoc extends Document {
  sessionDate: string; // YYYY-MM-DD
  ticker: string; // e.g., SPX
  strategy: string; // e.g., 0DTE_SELL_PUT
  deltaTarget: number;
  expiry: string; // YYYY-MM-DD
  indicators?: Record<string, unknown>;
  docs?: string[];
  confidence?: number;
  status: 'OPEN' | 'CLOSED';
  rationale?: string;
}

const RecommendationSchema = new Schema<RecommendationDoc>(
  {
    sessionDate: { type: String, required: true },
    ticker: { type: String, required: true },
    strategy: { type: String, required: true },
    deltaTarget: { type: Number, required: true },
    expiry: { type: String, required: true },
    indicators: { type: Schema.Types.Mixed },
    docs: { type: [String], default: [] },
    confidence: { type: Number },
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
    rationale: { type: String }
  },
  { timestamps: true }
);

export const RecommendationModel: Model<RecommendationDoc> =
  mongoose.models.Recommendation || mongoose.model<RecommendationDoc>('Recommendation', RecommendationSchema);

