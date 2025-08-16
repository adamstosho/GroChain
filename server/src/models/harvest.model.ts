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
    farmer: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    cropType: { type: String, required: true },
    quantity: { type: Number, required: false, default: 0 },
    date: { type: Date, required: false, default: () => new Date() },
    geoLocation: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false },
    },
    batchId: { type: String, required: false, unique: true, default: () => `BATCH-${Math.random().toString(36).slice(2, 10).toUpperCase()}` },
    qrData: { type: String, required: false, default: '' },
  },
  { timestamps: true }
);

export const Harvest = mongoose.model<IHarvest>('Harvest', HarvestSchema);

// Helpful indexes
HarvestSchema.index({ 'geoLocation.lat': 1, 'geoLocation.lng': 1 });
HarvestSchema.index({ createdAt: -1 });