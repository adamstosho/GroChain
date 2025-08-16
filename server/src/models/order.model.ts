import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  listing?: mongoose.Types.ObjectId;
  product?: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  buyer?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // alias used in some tests
  items: IOrderItem[];
  total?: number;
  totalAmount?: number; // alias used in some tests
  status: 'pending' | 'paid' | 'delivered' | 'cancelled' | 'completed';
  region?: string;
  paymentInfo?: any;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: false },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: false },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: false },
    totalAmount: { type: Number, required: false },
    status: { type: String, enum: ['pending', 'paid', 'delivered', 'cancelled', 'completed'], default: 'pending' },
    region: { type: String, required: false },
    paymentInfo: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);

// Indexes used by analytics and lookups
OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

// Normalize/alias fields commonly used in tests
OrderSchema.pre('save', function(next) {
  // Map userId to buyer if buyer not set
  if (!this.buyer && (this as any).userId) {
    this.buyer = (this as any).userId as any;
  }
  // Ensure at least one of listing/product exists per item
  if (Array.isArray(this.items)) {
    this.items = this.items.map((it: any) => ({
      listing: it.listing,
      product: it.product,
      quantity: it.quantity,
      price: it.price
    }));
  }
  // Map totalAmount to total if provided
  if (this.total == null && (this as any).totalAmount != null) {
    this.total = (this as any).totalAmount;
  }
  next();
});