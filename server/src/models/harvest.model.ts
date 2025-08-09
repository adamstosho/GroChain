import mongoose, { Document, Schema } from 'mongoose';

export interface IHarvest extends Document {
  farmer: mongoose.Types.ObjectId;
  cropType: string;
  quantity: number;
  date: Date;
  geoLocation: { lat: number; lng: number };
  batchId: string;
  qrData: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for populated harvest
export interface IHarvestPopulated extends Omit<IHarvest, 'farmer'> {
  farmer: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
  };
}

const HarvestSchema = new Schema<IHarvest>(
  {
    farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cropType: { type: String, required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, required: true },
    geoLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    batchId: { type: String, required: true, unique: true },
    qrData: { type: String, required: true },
  },
  { timestamps: true }
);

export const Harvest = mongoose.model<IHarvest>('Harvest', HarvestSchema);
