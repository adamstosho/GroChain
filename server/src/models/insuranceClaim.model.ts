import mongoose, { Document, Schema } from 'mongoose';

export interface IInsuranceClaim extends Document {
  policy: mongoose.Types.ObjectId;
  farmer: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  claimNumber: string;
  claimType: 'crop_loss' | 'livestock_death' | 'equipment_damage' | 'health_expense' | 'life_benefit';
  incidentDate: Date;
  reportedDate: Date;
  description: string;
  estimatedLoss: number;
  claimedAmount: number;
  approvedAmount?: number;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'paid' | 'closed';
  documents: {
    incidentReport: string;
    photos: string[];
    policeReport?: string;
    medicalReports?: string[];
    receipts?: string[];
  };
  assessment: {
    assessorId?: mongoose.Types.ObjectId;
    assessmentDate?: Date;
    findings: string;
    recommendations: string;
    estimatedValue: number;
  };
  payment: {
    paymentDate?: Date;
    paymentMethod: string;
    transactionId?: string;
    paymentNotes?: string;
  };
  timeline: {
    submitted: Date;
    acknowledged?: Date;
    assessmentStarted?: Date;
    assessmentCompleted?: Date;
    decisionMade?: Date;
    paymentProcessed?: Date;
    closed?: Date;
  };
  notes: {
    farmerNotes?: string;
    assessorNotes?: string;
    providerNotes?: string;
    adminNotes?: string;
  };
  referralFee: number; // Commission earned by GroChain
  referralStatus: 'pending' | 'paid' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
}

const InsuranceClaimSchema = new Schema<IInsuranceClaim>({
  policy: { type: Schema.Types.ObjectId, ref: 'InsurancePolicy', required: true },
  farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: Schema.Types.ObjectId, ref: 'InsuranceProvider', required: true },
  claimNumber: { type: String, required: true, unique: true },
  claimType: { 
    type: String, 
    enum: ['crop_loss', 'livestock_death', 'equipment_damage', 'health_expense', 'life_benefit'], 
    required: true 
  },
  incidentDate: { type: Date, required: true },
  reportedDate: { type: Date, required: true },
  description: { type: String, required: true },
  estimatedLoss: { type: Number, required: true },
  claimedAmount: { type: Number, required: true },
  approvedAmount: { type: Number },
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'approved', 'rejected', 'paid', 'closed'], 
    default: 'pending' 
  },
  documents: {
    incidentReport: { type: String, required: true },
    photos: [String],
    policeReport: String,
    medicalReports: [String],
    receipts: [String]
  },
  assessment: {
    assessorId: { type: Schema.Types.ObjectId, ref: 'User' },
    assessmentDate: Date,
    findings: { type: String, default: '' },
    recommendations: { type: String, default: '' },
    estimatedValue: { type: Number, default: 0 }
  },
  payment: {
    paymentDate: Date,
    paymentMethod: { type: String, required: true },
    transactionId: String,
    paymentNotes: String
  },
  timeline: {
    submitted: { type: Date, required: true },
    acknowledged: Date,
    assessmentStarted: Date,
    assessmentCompleted: Date,
    decisionMade: Date,
    paymentProcessed: Date,
    closed: Date
  },
  notes: {
    farmerNotes: String,
    assessorNotes: String,
    providerNotes: String,
    adminNotes: String
  },
  referralFee: { type: Number, required: true, default: 0 },
  referralStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'overdue'], 
    default: 'pending' 
  }
}, { timestamps: true });

// Indexes for efficient querying
InsuranceClaimSchema.index({ policy: 1 });
InsuranceClaimSchema.index({ farmer: 1 });
InsuranceClaimSchema.index({ provider: 1 });
InsuranceClaimSchema.index({ claimNumber: 1 });
InsuranceClaimSchema.index({ status: 1 });
InsuranceClaimSchema.index({ incidentDate: 1 });
InsuranceClaimSchema.index({ reportedDate: 1 });

export const InsuranceClaim = mongoose.model<IInsuranceClaim>('InsuranceClaim', InsuranceClaimSchema);

