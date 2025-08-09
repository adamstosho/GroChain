import mongoose, { Document, Schema } from 'mongoose';

export enum TransactionType {
  PAYMENT = 'payment',
  COMMISSION = 'commission',
  REFUND = 'refund',
  WITHDRAWAL = 'withdrawal',
  PLATFORM_FEE = 'platform_fee'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface ITransaction extends Document {
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  reference: string;
  description: string;
  userId: mongoose.Types.ObjectId;
  partnerId?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  referralId?: mongoose.Types.ObjectId;
  paymentProvider: string;
  paymentProviderReference: string;
  metadata: Record<string, any>;
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    type: { 
      type: String, 
      enum: Object.values(TransactionType), 
      required: true 
    },
    status: { 
      type: String, 
      enum: Object.values(TransactionStatus), 
      default: TransactionStatus.PENDING 
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'NGN' },
    reference: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    partnerId: { type: Schema.Types.ObjectId, ref: 'Partner' },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    referralId: { type: Schema.Types.ObjectId, ref: 'Referral' },
    paymentProvider: { type: String, required: true }, // 'paystack', 'manual', etc.
    paymentProviderReference: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for better query performance
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ partnerId: 1, createdAt: -1 });
// "reference" already has a unique index defined in the schema, avoid duplicating the index
TransactionSchema.index({ status: 1, type: 1 });

// Pre-save middleware to set processedAt when status changes to completed
TransactionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === TransactionStatus.COMPLETED && !this.processedAt) {
    this.processedAt = new Date();
  }
  next();
});

// Static method to create payment transaction
TransactionSchema.statics.createPayment = async function(data: {
  amount: number;
  reference: string;
  description: string;
  userId: string;
  orderId?: string;
  paymentProvider: string;
  paymentProviderReference?: string;
  metadata?: Record<string, any>;
}) {
  return this.create({
    type: TransactionType.PAYMENT,
    amount: data.amount,
    reference: data.reference,
    description: data.description,
    userId: data.userId,
    orderId: data.orderId,
    paymentProvider: data.paymentProvider,
    paymentProviderReference: data.paymentProviderReference,
    metadata: data.metadata || {}
  });
};

// Static method to create commission transaction
TransactionSchema.statics.createCommission = async function(data: {
  amount: number;
  reference: string;
  description: string;
  partnerId: string;
  referralId: string;
  metadata?: Record<string, any>;
}) {
  return this.create({
    type: TransactionType.COMMISSION,
    amount: data.amount,
    reference: data.reference,
    description: data.description,
    userId: data.partnerId, // Partner is the user for commission transactions
    partnerId: data.partnerId,
    referralId: data.referralId,
    paymentProvider: 'system',
    metadata: data.metadata || {}
  });
};

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
