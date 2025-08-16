import mongoose, { Document, Schema } from 'mongoose';

export interface IInsurancePolicy extends Document {
  farmer: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  policyType: 'crop' | 'livestock' | 'equipment' | 'health' | 'life';
  policyNumber: string;
  coverageAmount: number;
  premiumAmount: number;
  premiumFrequency: 'monthly' | 'quarterly' | 'annually';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  coverageDetails: {
    crops?: string[];
    livestock?: string[];
    equipment?: string[];
    healthCoverage?: string[];
    lifeCoverage?: string[];
  };
  terms: string[];
  exclusions: string[];
  referralFee: number; // Commission earned by GroChain
  referralStatus: 'pending' | 'paid' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
}

const InsurancePolicySchema = new Schema<IInsurancePolicy>({
  farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: Schema.Types.ObjectId, ref: 'InsuranceProvider', required: true },
  policyType: { 
    type: String, 
    enum: ['crop', 'livestock', 'equipment', 'health', 'life'], 
    required: true 
  },
  policyNumber: { type: String, required: true, unique: true },
  coverageAmount: { type: Number, required: true },
  premiumAmount: { type: Number, required: true },
  premiumFrequency: { 
    type: String, 
    enum: ['monthly', 'quarterly', 'annually'], 
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['active', 'expired', 'cancelled', 'suspended'], 
    default: 'active' 
  },
  coverageDetails: {
    crops: [String],
    livestock: [String],
    equipment: [String],
    healthCoverage: [String],
    lifeCoverage: [String]
  },
  terms: [String],
  exclusions: [String],
  referralFee: { type: Number, required: true, default: 0 },
  referralStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'overdue'], 
    default: 'pending' 
  }
}, { timestamps: true });

// Indexes for efficient querying
InsurancePolicySchema.index({ farmer: 1, status: 1 });
InsurancePolicySchema.index({ provider: 1, status: 1 });
InsurancePolicySchema.index({ policyNumber: 1 });
InsurancePolicySchema.index({ startDate: 1, endDate: 1 });

export const InsurancePolicy = mongoose.model<IInsurancePolicy>('InsurancePolicy', InsurancePolicySchema);

