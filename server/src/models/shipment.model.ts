import mongoose, { Document, Schema } from 'mongoose';

export interface IShipment extends Document {
  harvestBatch: mongoose.Types.ObjectId;
  source: string;
  destination: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema = new Schema<IShipment>(
  {
    harvestBatch: { type: Schema.Types.ObjectId, ref: 'Harvest', required: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Shipment = mongoose.model<IShipment>('Shipment', ShipmentSchema);
