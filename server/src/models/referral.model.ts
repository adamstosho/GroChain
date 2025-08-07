import mongoose, { Document, Schema } from 'mongoose';

export interface IReferral extends Document {
  farmer: mongoose.Types.ObjectId;
  partner: mongoose.Types.ObjectId;
  status: 'pending' | 'completed';
  commission: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    partner: { type: Schema.Types.ObjectId, ref: 'Partner', required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    commission: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);
