import mongoose, { Document, Schema } from 'mongoose';

// Compliance Report Interface
export interface IComplianceReport extends Document {
  title: string;
  type: 'regulatory' | 'financial' | 'environmental' | 'quality';
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  complianceScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  submittedBy: mongoose.Types.ObjectId;
  submittedAt: Date;
  dueDate: Date;
  requirements: string[];
  findings: string[];
  recommendations: string[];
  metadata: Record<string, any>;
}

// Audit Trail Interface
export interface IAuditTrail extends Document {
  action: string;
  entity: string;
  entityId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  timestamp: Date;
  details: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, any>;
}

// Compliance Metrics Interface
export interface IComplianceMetrics extends Document {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  status: 'compliant' | 'warning' | 'non_compliant';
  lastUpdated: Date;
  metadata: Record<string, any>;
}

// Regulatory Requirement Interface
export interface IRegulatoryRequirement extends Document {
  name: string;
  description: string;
  category: string;
  status: 'compliant' | 'non_compliant' | 'pending' | 'review';
  dueDate: Date;
  lastReview: Date;
  nextReview: Date;
  documents: string[];
  notes: string;
  metadata: Record<string, any>;
}

// Compliance Report Schema
const complianceReportSchema = new Schema<IComplianceReport>({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  type: {
    type: String,
    required: true,
    enum: ['regulatory', 'financial', 'environmental', 'quality']
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  complianceScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  requirements: [{
    type: String,
    required: true
  }],
  findings: [{
    type: String,
    required: true
  }],
  recommendations: [{
    type: String,
    required: true
  }],
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Audit Trail Schema
const auditTrailSchema = new Schema<IAuditTrail>({
  action: {
    type: String,
    required: true,
    maxlength: 100
  },
  entity: {
    type: String,
    required: true,
    maxlength: 100
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true,
    maxlength: 100
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  details: {
    type: String,
    required: true,
    maxlength: 500
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Compliance Metrics Schema
const complianceMetricsSchema = new Schema<IComplianceMetrics>({
  name: {
    type: String,
    required: true,
    maxlength: 100,
    unique: true
  },
  currentValue: {
    type: Number,
    required: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true,
    maxlength: 20
  },
  trend: {
    type: String,
    required: true,
    enum: ['improving', 'stable', 'declining'],
    default: 'stable'
  },
  status: {
    type: String,
    required: true,
    enum: ['compliant', 'warning', 'non_compliant'],
    default: 'compliant'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Regulatory Requirement Schema
const regulatoryRequirementSchema = new Schema<IRegulatoryRequirement>({
  name: {
    type: String,
    required: true,
    maxlength: 200,
    unique: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    maxlength: 100
  },
  status: {
    type: String,
    required: true,
    enum: ['compliant', 'non_compliant', 'pending', 'review'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  lastReview: {
    type: Date,
    default: Date.now
  },
  nextReview: {
    type: Date,
    required: true
  },
  documents: [{
    type: String,
    required: true
  }],
  notes: {
    type: String,
    maxlength: 1000
  },
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for better query performance
complianceReportSchema.index({ type: 1, status: 1 });
complianceReportSchema.index({ submittedBy: 1, submittedAt: -1 });
complianceReportSchema.index({ dueDate: 1, status: 1 });
auditTrailSchema.index({ entityId: 1, timestamp: -1 });
auditTrailSchema.index({ userId: 1, timestamp: -1 });
auditTrailSchema.index({ action: 1, timestamp: -1 });
complianceMetricsSchema.index({ status: 1, lastUpdated: -1 });
regulatoryRequirementSchema.index({ category: 1, status: 1 });
regulatoryRequirementSchema.index({ dueDate: 1, status: 1 });

// Export models
export const ComplianceReport = mongoose.model<IComplianceReport>('ComplianceReport', complianceReportSchema);
export const AuditTrail = mongoose.model<IAuditTrail>('AuditTrail', auditTrailSchema);
export const ComplianceMetrics = mongoose.model<IComplianceMetrics>('ComplianceMetrics', complianceMetricsSchema);
export const RegulatoryRequirement = mongoose.model<IRegulatoryRequirement>('RegulatoryRequirement', regulatoryRequirementSchema);
