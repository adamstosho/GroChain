import mongoose, { Document, Schema } from 'mongoose';

export interface IInsuranceProvider extends Document {
  name: string;
  code: string; // Unique identifier
  type: 'local' | 'international' | 'government' | 'cooperative';
  licenseNumber: string;
  regulatoryBody: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    website?: string;
  };
  products: {
    crop: boolean;
    livestock: boolean;
    equipment: boolean;
    health: boolean;
    life: boolean;
  };
  commissionRates: {
    crop: number; // Percentage
    livestock: number;
    equipment: number;
    health: number;
    life: number;
  };
  minimumPremium: number;
  maximumCoverage: number;
  claimsProcessingTime: number; // Days
  rating: number; // 1-5 stars
  status: 'active' | 'inactive' | 'suspended';
  partnershipDate: Date;
  referralFeePercentage: number; // GroChain's commission
  paymentTerms: string;
  documents: {
    license: string;
    certificate: string;
    terms: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const InsuranceProviderSchema = new Schema<IInsuranceProvider>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: ['local', 'international', 'government', 'cooperative'], 
    required: true 
  },
  licenseNumber: { type: String, required: true },
  regulatoryBody: { type: String, required: true },
  contactInfo: {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    website: String
  },
  products: {
    crop: { type: Boolean, default: false },
    livestock: { type: Boolean, default: false },
    equipment: { type: Boolean, default: false },
    health: { type: Boolean, default: false },
    life: { type: Boolean, default: false }
  },
  commissionRates: {
    crop: { type: Number, default: 0, min: 0, max: 100 },
    livestock: { type: Number, default: 0, min: 0, max: 100 },
    equipment: { type: Number, default: 0, min: 0, max: 100 },
    health: { type: Number, default: 0, min: 0, max: 100 },
    life: { type: Number, default: 0, min: 0, max: 100 }
  },
  minimumPremium: { type: Number, required: true },
  maximumCoverage: { type: Number, required: true },
  claimsProcessingTime: { type: Number, required: true, min: 1 },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active' 
  },
  partnershipDate: { type: Date, required: true },
  referralFeePercentage: { type: Number, required: true, min: 0, max: 100 },
  paymentTerms: { type: String, required: true },
  documents: {
    license: { type: String, required: true },
    certificate: { type: String, required: true },
    terms: { type: String, required: true }
  }
}, { timestamps: true });

// Indexes for efficient querying
InsuranceProviderSchema.index({ code: 1 });
InsuranceProviderSchema.index({ status: 1 });
InsuranceProviderSchema.index({ type: 1 });
InsuranceProviderSchema.index({ rating: -1 });

export const InsuranceProvider = mongoose.model<IInsuranceProvider>('InsuranceProvider', InsuranceProviderSchema);

