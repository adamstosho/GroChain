import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryItem extends Document {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  sku: string;
  barcode?: string;
  qrCode?: string;
  unit: string;
  unitPrice: number;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  supplier: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  location: string;
  expiryDate?: Date;
  harvestDate?: Date;
  quality: 'premium' | 'standard' | 'basic' | 'rejected';
  grade: 'A' | 'B' | 'C' | 'D';
  moistureContent?: number;
  proteinContent?: number;
  organic: boolean;
  certified: boolean;
  certificationBody?: string;
  certificationExpiry?: Date;
  batchNumber: string;
  lotNumber: string;
  countryOfOrigin: string;
  region: string;
  farmId?: mongoose.Types.ObjectId;
  farmerId?: mongoose.Types.ObjectId;
  partnerId?: mongoose.Types.ObjectId;
  status: 'active' | 'inactive' | 'discontinued' | 'recalled';
  tags: string[];
  images: string[];
  documents: string[];
  notes: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryItemSchema = new Schema<IInventoryItem>({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['grains', 'vegetables', 'fruits', 'tubers', 'legumes', 'spices', 'herbs', 'livestock', 'dairy', 'poultry', 'fish', 'equipment', 'supplies', 'other'],
    index: true
  },
  subcategory: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  barcode: {
    type: String,
    trim: true,
    sparse: true
  },
  qrCode: {
    type: String,
    trim: true,
    sparse: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'ton', 'lb', 'piece', 'bundle', 'bag', 'sack', 'carton', 'crate', 'bottle', 'liter', 'ml', 'dozen', 'pair', 'set', 'other'],
    index: true
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minStockLevel: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  maxStockLevel: {
    type: Number,
    required: true,
    min: 0
  },
  reorderPoint: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    required: true,
    index: true
  },
  warehouse: {
    type: Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true,
    index: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  expiryDate: {
    type: Date,
    index: true
  },
  harvestDate: {
    type: Date,
    index: true
  },
  quality: {
    type: String,
    required: true,
    enum: ['premium', 'standard', 'basic', 'rejected'],
    default: 'standard',
    index: true
  },
  grade: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D'],
    default: 'B',
    index: true
  },
  moistureContent: {
    type: Number,
    min: 0,
    max: 100
  },
  proteinContent: {
    type: Number,
    min: 0,
    max: 100
  },
  organic: {
    type: Boolean,
    default: false
  },
  certified: {
    type: Boolean,
    default: false
  },
  certificationBody: {
    type: String,
    trim: true
  },
  certificationExpiry: {
    type: Date
  },
  batchNumber: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  lotNumber: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  countryOfOrigin: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  region: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  farmId: {
    type: Schema.Types.ObjectId,
    ref: 'Farm',
    index: true
  },
  farmerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  partnerId: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'discontinued', 'recalled'],
    default: 'active',
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    trim: true
  }],
  documents: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
inventoryItemSchema.index({ category: 1, subcategory: 1 });
inventoryItemSchema.index({ supplier: 1, status: 1 });
inventoryItemSchema.index({ warehouse: 1, location: 1 });
inventoryItemSchema.index({ quality: 1, grade: 1 });
inventoryItemSchema.index({ expiryDate: 1, status: 1 });
inventoryItemSchema.index({ currentStock: 1, minStockLevel: 1 });
inventoryItemSchema.index({ createdAt: -1 });
inventoryItemSchema.index({ updatedAt: -1 });

// Virtual for stock status
inventoryItemSchema.virtual('stockStatus').get(function() {
  if (this.currentStock <= this.minStockLevel) return 'low';
  if (this.currentStock >= this.maxStockLevel) return 'high';
  return 'normal';
});

// Virtual for profit margin
inventoryItemSchema.virtual('profitMargin').get(function() {
  if (this.costPrice === 0) return 0;
  return ((this.sellingPrice - this.costPrice) / this.costPrice) * 100;
});

// Virtual for days until expiry
inventoryItemSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null;
  const now = new Date();
  const diffTime = this.expiryDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate SKU if not provided
inventoryItemSchema.pre('save', function(next) {
  if (!this.sku) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.sku = `INV-${this.category.substring(0, 3).toUpperCase()}-${timestamp}-${random}`.toUpperCase();
  }
  
  if (!this.batchNumber) {
    this.batchNumber = `BATCH-${Date.now()}`;
  }
  
  if (!this.lotNumber) {
    this.lotNumber = `LOT-${Date.now()}`;
  }
  
  next();
});

export const InventoryItem = mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema);
