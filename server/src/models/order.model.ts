import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  listing: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  buyer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'delivered' | 'cancelled';
  paymentInfo: any;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'delivered', 'cancelled'], default: 'pending' },
    paymentInfo: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);

// Indexes used by analytics and lookups
OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });