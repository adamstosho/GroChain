import mongoose, { Document, Schema } from 'mongoose';

export interface ICropAnalysis extends Document {
  imageUrl: string;
  farmer: mongoose.Types.ObjectId;
  fieldId?: string;
  cropType: string;
  analysisType: 'disease' | 'quality' | 'growth' | 'nutrient' | 'pest';
  confidence: number;
  results: {
    detectedIssues: Array<{
      issue: string;
      confidence: number;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendations: string[];
    }>;
    cropHealth: {
      overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
      score: number;
      factors: Array<{
        factor: string;
        status: 'good' | 'warning' | 'critical';
        value: string;
      }>;
    };
    growthStage: {
      current: string;
      estimatedDaysToHarvest: number;
      progress: number;
    };
    qualityMetrics: {
      color: string;
      texture: string;
      size: string;
      uniformity: number;
    };
  };
  metadata: {
    imageSize: {
      width: number;
      height: number;
    };
    captureDate: Date;
    location: {
      latitude: number;
      longitude: number;
    };
    weather: {
      temperature: number;
      humidity: number;
      rainfall: number;
    };
    processingTime: number;
    modelVersion: string;
  };
  recommendations: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    description: string;
    estimatedCost: number;
    estimatedTime: number;
    effectiveness: number;
  }>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const CropAnalysisSchema = new Schema<ICropAnalysis>({
  imageUrl: {
    type: String,
    required: true,
    index: true
  },
  farmer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fieldId: {
    type: String,
    index: true
  },
  cropType: {
    type: String,
    required: true,
    index: true
  },
  analysisType: {
    type: String,
    enum: ['disease', 'quality', 'growth', 'nutrient', 'pest'],
    required: true,
    index: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  results: {
    detectedIssues: [{
      issue: { type: String, required: true },
      confidence: { type: Number, min: 0, max: 100, required: true },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
      },
      description: { type: String, required: true },
      recommendations: [{ type: String }]
    }],
    cropHealth: {
      overall: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
        required: true
      },
      score: { type: Number, min: 0, max: 100, required: true },
      factors: [{
        factor: { type: String, required: true },
        status: {
          type: String,
          enum: ['good', 'warning', 'critical'],
          required: true
        },
        value: { type: String, required: true }
      }]
    },
    growthStage: {
      current: { type: String, required: true },
      estimatedDaysToHarvest: { type: Number, required: true },
      progress: { type: Number, min: 0, max: 100, required: true }
    },
    qualityMetrics: {
      color: { type: String, required: true },
      texture: { type: String, required: true },
      size: { type: String, required: true },
      uniformity: { type: Number, min: 0, max: 100, required: true }
    }
  },
  metadata: {
    imageSize: {
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    },
    captureDate: { type: Date, required: true },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    weather: {
      temperature: { type: Number },
      humidity: { type: Number },
      rainfall: { type: Number }
    },
    processingTime: { type: Number, required: true },
    modelVersion: { type: String, required: true }
  },
  recommendations: [{
    action: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      required: true
    },
    description: { type: String, required: true },
    estimatedCost: { type: Number, required: true },
    estimatedTime: { type: Number, required: true },
    effectiveness: { type: Number, min: 0, max: 100, required: true }
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
CropAnalysisSchema.index({ farmer: 1, cropType: 1 });
CropAnalysisSchema.index({ analysisType: 1, status: 1 });
CropAnalysisSchema.index({ 'results.cropHealth.overall': 1 });
CropAnalysisSchema.index({ createdAt: -1 });
CropAnalysisSchema.index({ 'metadata.location.latitude': 1, 'metadata.location.longitude': 1 });

// Virtual for risk level
CropAnalysisSchema.virtual('riskLevel').get(function() {
  const criticalIssues = this.results.detectedIssues.filter(issue => issue.severity === 'critical');
  const highIssues = this.results.detectedIssues.filter(issue => issue.severity === 'high');
  
  if (criticalIssues.length > 0) return 'critical';
  if (highIssues.length > 0) return 'high';
  if (this.results.cropHealth.overall === 'poor' || this.results.cropHealth.overall === 'critical') return 'medium';
  return 'low';
});

// Virtual for action required
CropAnalysisSchema.virtual('actionRequired').get(function() {
  return this.results.detectedIssues.length > 0 || this.results.cropHealth.overall === 'poor' || this.results.cropHealth.overall === 'critical';
});

// Pre-save middleware to calculate confidence
CropAnalysisSchema.pre('save', function(next) {
  if (this.results.detectedIssues.length > 0) {
    const avgConfidence = this.results.detectedIssues.reduce((sum, issue) => sum + issue.confidence, 0) / this.results.detectedIssues.length;
    this.confidence = Math.round(avgConfidence);
  }
  next();
});

// Static methods
CropAnalysisSchema.statics.findByFarmer = function(farmerId: string) {
  return this.find({ farmer: farmerId }).sort({ createdAt: -1 });
};

CropAnalysisSchema.statics.findByCropType = function(cropType: string) {
  return this.find({ cropType }).sort({ createdAt: -1 });
};

CropAnalysisSchema.statics.findByHealthStatus = function(healthStatus: string) {
  return this.find({ 'results.cropHealth.overall': healthStatus }).sort({ createdAt: -1 });
};

CropAnalysisSchema.statics.findByLocation = function(lat: number, lng: number, radius: number = 5000) {
  return this.find({
    'metadata.location.latitude': { $gte: lat - radius/111000, $lte: lat + radius/111000 },
    'metadata.location.longitude': { $gte: lng - radius/111000, $lte: lng + radius/111000 }
  }).sort({ createdAt: -1 });
};

CropAnalysisSchema.statics.findHighRiskAnalyses = function() {
  return this.find({
    $or: [
      { 'results.detectedIssues.severity': { $in: ['high', 'critical'] } },
      { 'results.cropHealth.overall': { $in: ['poor', 'critical'] } }
    ]
  }).sort({ createdAt: -1 });
};

// Instance methods
CropAnalysisSchema.methods.addRecommendation = function(action: string, priority: string, description: string, estimatedCost: number, estimatedTime: number, effectiveness: number) {
  this.recommendations.push({
    action,
    priority,
    description,
    estimatedCost,
    estimatedTime,
    effectiveness
  });
  
  return this.save();
};

CropAnalysisSchema.methods.updateStatus = function(newStatus: string) {
  this.status = newStatus;
  return this.save();
};

export const CropAnalysis = mongoose.model<ICropAnalysis>('CropAnalysis', CropAnalysisSchema);
export default CropAnalysis;

