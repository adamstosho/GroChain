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
  type: PartnerType;
  contactEmail: string;
  contactPhone: string;
  referralCode: string;
  commissionBalance: number;
  onboardedFarmers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PartnerSchema = new Schema<IPartner>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: Object.values(PartnerType), required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    referralCode: { type: String, required: true, unique: true },
    commissionBalance: { type: Number, default: 0 },
    onboardedFarmers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Partner = mongoose.model<IPartner>('Partner', PartnerSchema);
