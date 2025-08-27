const mongoose = require('mongoose')

const ListingSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  harvest: { type: mongoose.Schema.Types.ObjectId, ref: 'Harvest' },
  cropName: { type: String, required: true },
  category: { type: String, required: true },
  variety: { type: String },
  description: { type: String, required: true },
  basePrice: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  availableQuantity: { type: Number, required: true, min: 0 },
  seasonality: [{ type: String }],
  qualityGrade: { type: String, enum: ['premium', 'standard', 'basic'], default: 'standard' },
  organic: { type: Boolean, default: false },
  certifications: [{ type: String }],
  storageLife: { type: Number }, // in days
  nutritionalValue: {
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fiber: { type: Number },
    vitamins: [{ type: String }]
  },
  farmingPractices: [{ type: String }],
  pestResistance: [{ type: String }],
  diseaseResistance: [{ type: String }],
  yieldPotential: { type: Number },
  maturityDays: { type: Number },
  waterRequirement: { type: String, enum: ['low', 'medium', 'high'] },
  soilType: [{ type: String }],
  climateZone: [{ type: String }],
  marketDemand: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  exportPotential: { type: Boolean, default: false },
  processingRequirements: [{ type: String }],
  packagingOptions: [{ type: String }],
  transportationRequirements: [{ type: String }],
  images: [{ type: String }],
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'Nigeria' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  status: { 
    type: String, 
    enum: ['draft', 'active', 'inactive', 'sold_out', 'expired'], 
    default: 'draft' 
  },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  favorites: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  metadata: { type: Object }
}, { timestamps: true })

ListingSchema.index({ farmer: 1 })
ListingSchema.index({ cropName: 1 })
ListingSchema.index({ category: 1 })
ListingSchema.index({ status: 1 })
ListingSchema.index({ location: '2dsphere' })
ListingSchema.index({ featured: 1 })
ListingSchema.index({ createdAt: -1 })

// Text search index
ListingSchema.index({ 
  cropName: 'text', 
  description: 'text', 
  tags: 'text' 
})

module.exports = mongoose.model('Listing', ListingSchema)
