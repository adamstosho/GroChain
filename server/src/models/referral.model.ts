import mongoose, { Document, Schema } from 'mongoose';

export interface IReferral extends Document {
  farmer: mongoose.Types.ObjectId;
  partner: mongoose.Types.ObjectId;
  status: 'pending' | 'completed' | 'cancelled';
  commission: number;
  commissionRate: number;
  transactionAmount: number;
  transactionId: string;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    partner: { type: Schema.Types.ObjectId, ref: 'Partner', required: true },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    commission: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 0.05 }, // 5% default commission rate
    transactionAmount: { type: Number, default: 0 },
    transactionId: { type: String, unique: true, sparse: true },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate commission
ReferralSchema.pre('save', function(next) {
  if (this.isModified('transactionAmount') && this.transactionAmount > 0) {
    this.commission = this.transactionAmount * this.commissionRate;
  }
  next();
});

// Method to complete referral and update partner balance
ReferralSchema.methods.completeReferral = async function(transactionAmount: number, transactionId: string) {
  this.status = 'completed';
  this.transactionAmount = transactionAmount;
  this.transactionId = transactionId;
  this.completedAt = new Date();
  
  // Recalculate commission
  this.commission = transactionAmount * this.commissionRate;
  
  await this.save();
  
  // Update partner's commission balance
  const Partner = mongoose.model('Partner');
  await Partner.findByIdAndUpdate(
    this.partner,
    { $inc: { commissionBalance: this.commission } }
  );
  
  return this;
};

export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);
