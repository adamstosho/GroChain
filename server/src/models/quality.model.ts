import mongoose, { Document, Schema } from 'mongoose';

export interface IQualityStandard extends Document {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  standardCode: string;
  version: string;
  effectiveDate: Date;
  expiryDate?: Date;
  status: 'active' | 'draft' | 'archived' | 'superseded';
  parameters: {
    name: string;
    unit: string;
    minValue?: number;
    maxValue?: number;
    targetValue?: number;
    tolerance?: number;
    required: boolean;
    description: string;
  }[];
  testingMethods: {
    name: string;
    description: string;
    equipment: string;
    duration: number;
    cost: number;
  }[];
  certificationBody: string;
  regulatoryCompliance: string[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQualityInspection extends Document {
  inspectionId: string;
  productId: mongoose.Types.ObjectId;
  batchNumber: string;
  lotNumber: string;
  inspectionType: 'pre-harvest' | 'post-harvest' | 'storage' | 'transport' | 'final' | 'random' | 'complaint';
  inspector: mongoose.Types.ObjectId;
  inspectionDate: Date;
  location: string;
  weatherConditions?: {
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
  };
  sampleSize: number;
  sampleUnit: string;
  inspectionResults: {
    parameter: string;
    measuredValue: number;
    unit: string;
    minValue: number;
    maxValue: number;
    targetValue: number;
    status: 'pass' | 'fail' | 'marginal';
    notes: string;
  }[];
  overallResult: 'pass' | 'fail' | 'conditional_pass' | 'pending';
  qualityScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  defects: {
    type: string;
    severity: 'minor' | 'major' | 'critical';
    count: number;
    description: string;
    images: string[];
  }[];
  recommendations: string[];
  correctiveActions: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
  attachments: string[];
  notes: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQualityTest extends Document {
  testId: string;
  testName: string;
  testType: 'chemical' | 'physical' | 'microbiological' | 'sensory' | 'nutritional' | 'pesticide' | 'heavy_metal' | 'other';
  description: string;
  category: string;
  subcategory: string;
  testMethod: string;
  equipment: string;
  reagents: string[];
  duration: number;
  cost: number;
  accuracy: number;
  precision: number;
  detectionLimit: number;
  unit: string;
  parameters: {
    name: string;
    unit: string;
    minValue?: number;
    maxValue?: number;
    targetValue?: number;
    description: string;
  }[];
  qualityControl: {
    controlType: string;
    frequency: string;
    acceptanceCriteria: string;
  }[];
  regulatoryCompliance: string[];
  certification: string[];
  status: 'active' | 'inactive' | 'under_review' | 'discontinued';
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const qualityStandardSchema = new Schema<IQualityStandard>({
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
  standardCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  version: {
    type: String,
    required: true,
    default: '1.0'
  },
  effectiveDate: {
    type: Date,
    required: true,
    index: true
  },
  expiryDate: {
    type: Date,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'draft', 'archived', 'superseded'],
    default: 'draft',
    index: true
  },
  parameters: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    unit: {
      type: String,
      required: true,
      trim: true
    },
    minValue: Number,
    maxValue: Number,
    targetValue: Number,
    tolerance: Number,
    required: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      trim: true
    }
  }],
  testingMethods: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    equipment: {
      type: String,
      trim: true
    },
    duration: {
      type: Number,
      min: 0
    },
    cost: {
      type: Number,
      min: 0
    }
  }],
  certificationBody: {
    type: String,
    required: true,
    trim: true
  },
  regulatoryCompliance: [{
    type: String,
    trim: true
  }],
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

const qualityInspectionSchema = new Schema<IQualityInspection>({
  inspectionId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true,
    index: true
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
  inspectionType: {
    type: String,
    required: true,
    enum: ['pre-harvest', 'post-harvest', 'storage', 'transport', 'final', 'random', 'complaint'],
    index: true
  },
  inspector: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  inspectionDate: {
    type: Date,
    required: true,
    index: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  weatherConditions: {
    temperature: Number,
    humidity: Number,
    rainfall: Number,
    windSpeed: Number
  },
  sampleSize: {
    type: Number,
    required: true,
    min: 1
  },
  sampleUnit: {
    type: String,
    required: true,
    trim: true
  },
  inspectionResults: [{
    parameter: {
      type: String,
      required: true,
      trim: true
    },
    measuredValue: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true,
      trim: true
    },
    minValue: {
      type: Number,
      required: true
    },
    maxValue: {
      type: Number,
      required: true
    },
    targetValue: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['pass', 'fail', 'marginal']
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  overallResult: {
    type: String,
    required: true,
    enum: ['pass', 'fail', 'conditional_pass', 'pending'],
    index: true
  },
  qualityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    index: true
  },
  grade: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D', 'F'],
    index: true
  },
  defects: [{
    type: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      required: true,
      enum: ['minor', 'major', 'critical']
    },
    count: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      trim: true
    },
    images: [{
      type: String,
      trim: true
    }]
  }],
  recommendations: [{
    type: String,
    trim: true
  }],
  correctiveActions: [{
    type: String,
    trim: true
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  attachments: [{
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

const qualityTestSchema = new Schema<IQualityTest>({
  testId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  testName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  testType: {
    type: String,
    required: true,
    enum: ['chemical', 'physical', 'microbiological', 'sensory', 'nutritional', 'pesticide', 'heavy_metal', 'other'],
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
    trim: true,
    index: true
  },
  subcategory: {
    type: String,
    required: true,
    trim: true
  },
  testMethod: {
    type: String,
    required: true,
    trim: true
  },
  equipment: {
    type: String,
    required: true,
    trim: true
  },
  reagents: [{
    type: String,
    trim: true
  }],
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  precision: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  detectionLimit: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  parameters: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    unit: {
      type: String,
      required: true,
      trim: true
    },
    minValue: Number,
    maxValue: Number,
    targetValue: Number,
    description: {
      type: String,
      trim: true
    }
  }],
  qualityControl: [{
    controlType: {
      type: String,
      required: true,
      trim: true
    },
    frequency: {
      type: String,
      required: true,
      trim: true
    },
    acceptanceCriteria: {
      type: String,
      required: true,
      trim: true
    }
  }],
  regulatoryCompliance: [{
    type: String,
    trim: true
  }],
  certification: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'under_review', 'discontinued'],
    default: 'active',
    index: true
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
qualityStandardSchema.index({ category: 1, subcategory: 1 });
qualityStandardSchema.index({ status: 1, effectiveDate: 1 });
qualityStandardSchema.index({ standardCode: 1, version: 1 });

qualityInspectionSchema.index({ productId: 1, inspectionDate: 1 });
qualityInspectionSchema.index({ batchNumber: 1, lotNumber: 1 });
qualityInspectionSchema.index({ inspector: 1, inspectionDate: 1 });
qualityInspectionSchema.index({ overallResult: 1, qualityScore: 1 });
qualityInspectionSchema.index({ inspectionType: 1, status: 1 });

qualityTestSchema.index({ testType: 1, category: 1 });
qualityTestSchema.index({ status: 1, testName: 1 });
qualityTestSchema.index({ testId: 1, testType: 1 });

// Pre-save middleware to generate IDs
qualityInspectionSchema.pre('save', function(next) {
  if (!this.inspectionId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.inspectionId = `INS-${this.inspectionType.substring(0, 3).toUpperCase()}-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

qualityTestSchema.pre('save', function(next) {
  if (!this.testId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.testId = `TEST-${this.testType.substring(0, 3).toUpperCase()}-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

export const QualityStandard = mongoose.model<IQualityStandard>('QualityStandard', qualityStandardSchema);
export const QualityInspection = mongoose.model<IQualityInspection>('QualityInspection', qualityInspectionSchema);
export const QualityTest = mongoose.model<IQualityTest>('QualityTest', qualityTestSchema);
