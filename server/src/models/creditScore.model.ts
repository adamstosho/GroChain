import mongoose, { Document, Schema } from 'mongoose';

export interface ICreditScoreHistory {
  transactionId: string;
  amount: number;
  date: Date;
}

export interface ICreditScore extends Document {
  farmer: mongoose.Types.ObjectId;
  score: number;
  history: ICreditScoreHistory[];
  updatedAt: Date;
}

const CreditScoreHistorySchema = new Schema<ICreditScoreHistory>(
  {
    transactionId: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { _id: false }
);

const CreditScoreSchema = new Schema<ICreditScore>(
  {
    farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true, default: 0 },
    history: { type: [CreditScoreHistorySchema], default: [] },
  },
  { timestamps: { updatedAt: true, createdAt: false } }
);

export const CreditScore = mongoose.model<ICreditScore>('CreditScore', CreditScoreSchema);
