import mongoose, { Document, Schema } from 'mongoose';

export interface ILoanReferral extends Document {
  farmer?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // alias used in some tests
  loanAmount?: number; // alias
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid';
  partner?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LoanReferralSchema = new Schema<ILoanReferral>(
  {
    farmer: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    amount: { type: Number, required: false, default: 0 },
    loanAmount: { type: Number, required: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'disbursed', 'repaid'], default: 'pending' },
    partner: { type: Schema.Types.ObjectId, ref: 'Partner', required: false },
  },
  { timestamps: true }
);

export const LoanReferral = mongoose.model<ILoanReferral>('LoanReferral', LoanReferralSchema);

// Normalize aliases for tests
LoanReferralSchema.pre('save', function(next) {
  if (!this.farmer && (this as any).userId) {
    this.farmer = (this as any).userId as any;
  }
  if ((this as any).loanAmount != null && (this as any).amount == null) {
    (this as any).amount = (this as any).loanAmount;
  }
  next();
});
