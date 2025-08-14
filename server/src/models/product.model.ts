import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  cropName: string;
  category: string;
  variety?: string;
  description?: string;
  basePrice: number;
  unit: string;
  seasonality: string[];
  region: string[];
  qualityGrade: 'premium' | 'standard' | 'basic';
  organic: boolean;
  certifications: string[];
  storageLife: number; // in days
  nutritionalValue?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fiber?: number;
    vitamins?: string[];
    minerals?: string[];
  };
  farmingPractices: string[];
  pestResistance: string[];
  diseaseResistance: string[];
  yieldPotential: number; // kg per hectare
  maturityDays: number;
  waterRequirement: 'low' | 'medium' | 'high';
  soilType: string[];
  climateZone: string[];
  marketDemand: 'high' | 'medium' | 'low';
  exportPotential: boolean;
  processingRequirements: string[];
  packagingOptions: string[];
  transportationRequirements: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  cropName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['grains', 'tubers', 'vegetables', 'fruits', 'legumes', 'cash_crops', 'spices', 'herbs'],
    index: true
  },
  variety: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'ton', 'bag', 'piece', 'bundle', 'litre'],
    default: 'kg'
  },
  seasonality: [{
    type: String,
    enum: ['rainy', 'dry', 'all-year']
  }],
  region: [{
    type: String,
    trim: true
  }],
  qualityGrade: {
    type: String,
    enum: ['premium', 'standard', 'basic'],
    default: 'standard'
  },
  organic: {
    type: Boolean,
    default: false
  },
  certifications: [{
    type: String,
    trim: true
  }],
  storageLife: {
    type: Number,
    required: true,
    min: 1,
    default: 30
  },
  nutritionalValue: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fiber: Number,
    vitamins: [String],
    minerals: [String]
  },
  farmingPractices: [{
    type: String,
    trim: true
  }],
  pestResistance: [{
    type: String,
    trim: true
  }],
  diseaseResistance: [{
    type: String,
    trim: true
  }],
  yieldPotential: {
    type: Number,
    required: true,
    min: 0
  },
  maturityDays: {
    type: Number,
    required: true,
    min: 1
  },
  waterRequirement: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  soilType: [{
    type: String,
    trim: true
  }],
  climateZone: [{
    type: String,
    trim: true
  }],
  marketDemand: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  exportPotential: {
    type: Boolean,
    default: false
  },
  processingRequirements: [{
    type: String,
    trim: true
  }],
  packagingOptions: [{
    type: String,
    trim: true
  }],
  transportationRequirements: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ProductSchema.index({ cropName: 'text', description: 'text' });
ProductSchema.index({ category: 1, marketDemand: 1 });
ProductSchema.index({ seasonality: 1, region: 1 });
ProductSchema.index({ basePrice: 1 });
ProductSchema.index({ yieldPotential: -1 });
ProductSchema.index({ marketDemand: -1, exportPotential: 1 });

// Virtual for price per kg
ProductSchema.virtual('pricePerKg').get(function() {
  if (this.unit === 'kg') return this.basePrice;
  if (this.unit === 'ton') return this.basePrice / 1000;
  if (this.unit === 'bag') return this.basePrice / 50; // Assuming 50kg bag
  return this.basePrice;
});

// Virtual for market value
ProductSchema.virtual('marketValue').get(function() {
  return this.basePrice * this.yieldPotential;
});

// Pre-save middleware to set default values
ProductSchema.pre('save', function(next) {
  if (!this.seasonality || this.seasonality.length === 0) {
    // Set default seasonality based on crop category
    if (['grains', 'tubers', 'legumes'].includes(this.category)) {
      this.seasonality = ['rainy'];
    } else if (['vegetables', 'fruits'].includes(this.category)) {
      this.seasonality = ['dry'];
    } else {
      this.seasonality = ['all-year'];
    }
  }

  if (!this.region || this.region.length === 0) {
    this.region = ['Nigeria'];
  }

  next();
});

// Static method to get products by category
ProductSchema.statics.findByCategory = function(category: string) {
  return this.find({ category });
};

// Static method to get products by season
ProductSchema.statics.findBySeason = function(season: string) {
  return this.find({ seasonality: season });
};

// Static method to get products by region
ProductSchema.statics.findByRegion = function(region: string) {
  return this.find({ region: { $regex: region, $options: 'i' } });
};

// Static method to get high-demand products
ProductSchema.statics.findHighDemand = function() {
  return this.find({ marketDemand: 'high' });
};

// Static method to get export-ready products
ProductSchema.statics.findExportReady = function() {
  return this.find({ exportPotential: true });
};

// Instance method to check if product is in season
ProductSchema.methods.isInSeason = function(season: string): boolean {
  return this.seasonality.includes(season) || this.seasonality.includes('all-year');
};

  // Instance method to check if product is suitable for region
  ProductSchema.methods.isSuitableForRegion = function(region: string): boolean {
    return this.region.some((r: string) =>
      r.toLowerCase().includes(region.toLowerCase()) || 
      region.toLowerCase().includes(r.toLowerCase())
    );
  };

// Instance method to get price recommendation
ProductSchema.methods.getPriceRecommendation = function(marketDemand: string): number {
  let multiplier = 1;
  
  if (marketDemand === 'high') {
    multiplier = 1.2;
  } else if (marketDemand === 'low') {
    multiplier = 0.8;
  }
  
  return Math.round(this.basePrice * multiplier);
};

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
