import mongoose, { Document, Schema } from 'mongoose';

export interface IFarmerProfile extends Document {
  farmerId: mongoose.Types.ObjectId;
  state: string;
  lga: string;
  address?: string;
  farmSize?: number;
  cropTypes?: string;
  experience?: number;
  notes?: string;
  organization?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerProfileSchema = new Schema<IFarmerProfile>(
  {
    farmerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      unique: true 
    },
    state: { 
      type: String, 
      required: true 
    },
    lga: { 
      type: String, 
      required: true 
    },
    address: { 
      type: String 
    },
    farmSize: { 
      type: Number,
      min: 0 
    },
    cropTypes: { 
      type: String 
    },
    experience: { 
      type: Number,
      min: 0 
    },
    notes: { 
      type: String 
    },
    organization: { 
      type: String 
    }
  },
  { timestamps: true }
);

// Create index for efficient queries
FarmerProfileSchema.index({ farmerId: 1 });
FarmerProfileSchema.index({ state: 1, lga: 1 });

export const FarmerProfile = mongoose.model<IFarmerProfile>('FarmerProfile', FarmerProfileSchema);
