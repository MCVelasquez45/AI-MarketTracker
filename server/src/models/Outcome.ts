import mongoose, { Schema, Document, Model } from 'mongoose';

export interface OutcomeDoc extends Document {
  recId: mongoose.Types.ObjectId;
  pnl?: number;
  outcome: 'WIN' | 'LOSS' | 'N/A';
  notes?: string;
}

const OutcomeSchema = new Schema<OutcomeDoc>(
  {
    recId: { type: Schema.Types.ObjectId, required: true, index: true },
    pnl: { type: Number },
    outcome: { type: String, enum: ['WIN', 'LOSS', 'N/A'], required: true },
    notes: { type: String }
  },
  { timestamps: true }
);

export const OutcomeModel: Model<OutcomeDoc> =
  mongoose.models.Outcome || mongoose.model<OutcomeDoc>('Outcome', OutcomeSchema);

