import mongoose, { Document, Schema } from 'mongoose';

export interface IListing extends Document {
  product: string;
  price: number;
  quantity: number;
  farmer: mongoose.Types.ObjectId;
  partner: mongoose.Types.ObjectId;
  images: string[];
  status: 'active' | 'sold' | 'removed';
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    product: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    partner: { type: Schema.Types.ObjectId, ref: 'Partner', required: true },
    images: { type: [String], default: [] },
    status: { type: String, enum: ['active', 'sold', 'removed'], default: 'active' },
  },
  { timestamps: true }
);

export const Listing = mongoose.model<IListing>('Listing', ListingSchema);

// Indexes for common queries
ListingSchema.index({ status: 1, createdAt: -1 });
ListingSchema.index({ product: 'text' });
ListingSchema.index({ partner: 1 });