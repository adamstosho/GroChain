import mongoose, { Document, Schema } from 'mongoose';

export enum PartnerType {
  AGENCY = 'agency',
  COOPERATIVE = 'cooperative',
  NGO = 'ngo',
  ASSOCIATION = 'association',
  OTHER = 'other',
}

export interface IPartner extends Document {
  name: string;
  type?: PartnerType;
  contactEmail?: string;
  contactPhone?: string;
  referralCode?: string;
  commissionBalance: number;
  onboardedFarmers: mongoose.Types.ObjectId[];
  // Additional optional analytics fields used in tests and reports
  email?: string;
  farmerCount?: number;
  revenueGenerated?: number;
  isActive?: boolean;
  region?: string;
  createdAt: Date;
  updatedAt: Date;
}

function generateReferralCode(): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PART-${random}`;
}

const PartnerSchema = new Schema<IPartner>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: Object.values(PartnerType), default: PartnerType.OTHER },
    contactEmail: { type: String },
    contactPhone: { type: String },
    referralCode: { type: String, unique: true, default: generateReferralCode },
    commissionBalance: { type: Number, default: 0 },
    onboardedFarmers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // Optional analytics/reporting fields (non-blocking for creation)
    email: { type: String },
    farmerCount: { type: Number },
    revenueGenerated: { type: Number },
    isActive: { type: Boolean },
    region: { type: String },
  },
  { timestamps: true }
);

export const Partner = mongoose.model<IPartner>('Partner', PartnerSchema);
