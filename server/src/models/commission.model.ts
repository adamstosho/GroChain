import mongoose, { Document, Schema } from 'mongoose';

export interface ICommission extends Document {
  commissionId: string;
  partnerId: mongoose.Types.ObjectId;
  referralId: mongoose.Types.ObjectId;
  transactionId: mongoose.Types.ObjectId;
  transactionType: 'harvest' | 'marketplace' | 'fintech' | 'subscription' | 'other';
  transactionAmount: number;
  commissionRate: number;
  commissionAmount: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected' | 'cancelled';
  paymentMethod: 'bank_transfer' | 'mobile_money' | 'wallet' | 'check' | 'other';
  paymentReference?: string;
  paymentDate?: Date;
  dueDate: Date;
  description: string;
  notes: string;
  attachments: string[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommissionWithdrawal extends Document {
  withdrawalId: string;
  partnerId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: 'bank_transfer' | 'mobile_money' | 'wallet' | 'check' | 'other';
  bankDetails?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    swiftCode?: string;
    routingNumber?: string;
  };
  mobileMoneyDetails?: {
    provider: string;
    phoneNumber: string;
    accountName: string;
  };
  walletDetails?: {
    walletType: string;
    walletAddress: string;
    walletName: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  processingFee: number;
  netAmount: number;
  requestDate: Date;
  processedDate?: Date;
  completedDate?: Date;
  failureReason?: string;
  adminNotes: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommissionTier extends Document {
  tierId: string;
  tierName: string;
  description: string;
  minTransactions: number;
  maxTransactions?: number;
  commissionRate: number;
  bonusRate?: number;
  benefits: string[];
  status: 'active' | 'inactive' | 'archived';
  effectiveDate: Date;
  expiryDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commissionSchema = new Schema<ICommission>({
  commissionId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  partnerId: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    required: true,
    index: true
  },
  referralId: {
    type: Schema.Types.ObjectId,
    ref: 'Referral',
    required: true,
    index: true
  },
  transactionId: {
    type: Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true,
    index: true
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['harvest', 'marketplace', 'fintech', 'subscription', 'other'],
    index: true
  },
  transactionAmount: {
    type: Number,
    required: true,
    min: 0
  },
  commissionRate: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  commissionAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'NGN',
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'paid', 'rejected', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['bank_transfer', 'mobile_money', 'wallet', 'check', 'other'],
    index: true
  },
  paymentReference: {
    type: String,
    trim: true,
    sparse: true
  },
  paymentDate: {
    type: Date,
    index: true
  },
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const commissionWithdrawalSchema = new Schema<ICommissionWithdrawal>({
  withdrawalId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  partnerId: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'NGN',
    trim: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['bank_transfer', 'mobile_money', 'wallet', 'check', 'other'],
    index: true
  },
  bankDetails: {
    accountNumber: String,
    accountName: String,
    bankName: String,
    swiftCode: String,
    routingNumber: String
  },
  mobileMoneyDetails: {
    provider: String,
    phoneNumber: String,
    accountName: String
  },
  walletDetails: {
    walletType: String,
    walletAddress: String,
    walletName: String
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  processingFee: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  netAmount: {
    type: Number,
    required: true,
    min: 0
  },
  requestDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  processedDate: {
    type: Date,
    index: true
  },
  completedDate: {
    type: Date,
    index: true
  },
  failureReason: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const commissionTierSchema = new Schema<ICommissionTier>({
  tierId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  tierName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  minTransactions: {
    type: Number,
    required: true,
    min: 0
  },
  maxTransactions: {
    type: Number,
    min: 0
  },
  commissionRate: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  bonusRate: {
    type: Number,
    min: 0,
    max: 1
  },
  benefits: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'archived'],
    default: 'active',
    index: true
  },
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  expiryDate: {
    type: Date,
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
commissionSchema.index({ partnerId: 1, status: 1 });
commissionSchema.index({ transactionType: 1, status: 1 });
commissionSchema.index({ dueDate: 1, status: 1 });
commissionSchema.index({ createdAt: -1 });
commissionSchema.index({ paymentDate: 1, status: 1 });

commissionWithdrawalSchema.index({ partnerId: 1, status: 1 });
commissionWithdrawalSchema.index({ status: 1, requestDate: 1 });
commissionWithdrawalSchema.index({ withdrawalId: 1, status: 1 });

commissionTierSchema.index({ status: 1, effectiveDate: 1 });
commissionTierSchema.index({ minTransactions: 1, maxTransactions: 1 });

// Pre-save middleware to generate IDs
commissionSchema.pre('save', function(next) {
  if (!this.commissionId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.commissionId = `COM-${this.transactionType.substring(0, 3).toUpperCase()}-${timestamp}-${random}`.toUpperCase();
  }
  
  if (!this.dueDate) {
    // Set due date to 30 days from creation
    this.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

commissionWithdrawalSchema.pre('save', function(next) {
  if (!this.withdrawalId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.withdrawalId = `WTH-${timestamp}-${random}`.toUpperCase();
  }
  
  if (!this.netAmount) {
    this.netAmount = this.amount - this.processingFee;
  }
  
  next();
});

commissionTierSchema.pre('save', function(next) {
  if (!this.tierId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.tierId = `TIER-${this.tierName.substring(0, 3).toUpperCase()}-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Virtual for days until due
commissionSchema.virtual('daysUntilDue').get(function() {
  const now = new Date();
  const diffTime = this.dueDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
commissionSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && new Date() > this.dueDate;
});

export const Commission = mongoose.model<ICommission>('Commission', commissionSchema);
export const CommissionWithdrawal = mongoose.model<ICommissionWithdrawal>('CommissionWithdrawal', commissionWithdrawalSchema);
export const CommissionTier = mongoose.model<ICommissionTier>('CommissionTier', commissionTierSchema);
