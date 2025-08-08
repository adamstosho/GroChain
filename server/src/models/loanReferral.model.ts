import mongoose, { Document, Schema } from 'mongoose';

export interface ILoanReferral extends Document {
  farmer: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  partner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LoanReferralSchema = new Schema<ILoanReferral>(
  {
    farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'disbursed'], default: 'pending' },
    partner: { type: Schema.Types.ObjectId, ref: 'Partner', required: true },
  },
  { timestamps: true }
);

export const LoanReferral = mongoose.model<ILoanReferral>('LoanReferral', LoanReferralSchema);
