import mongoose, { Document, Schema } from 'mongoose';

// Loan Application Interface
export interface ILoanApplication extends Document {
  farmerId: mongoose.Types.ObjectId;
  amount: number;
  purpose: string;
  term: number;
  status: 'submitted' | 'approved' | 'rejected' | 'disbursed' | 'repaid';
  interestRate: number;
  monthlyPayment: number;
  totalRepayment: number;
  submittedAt: Date;
  approvedAt?: Date;
  disbursedAt?: Date;
  dueDate: Date;
  description?: string;
  documents: string[];
  metadata: Record<string, any>;
}

// Insurance Policy Interface
export interface IInsurancePolicy extends Document {
  farmerId: mongoose.Types.ObjectId;
  type: 'crop' | 'livestock' | 'equipment' | 'health' | 'life';
  coverage: number;
  premium: number;
  deductible: number;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: Date;
  endDate: Date;
  crops?: Array<{
    name: string;
    area: number;
    coverage: number;
  }>;
  metadata: Record<string, any>;
}

// Financial Health Interface
export interface IFinancialHealth extends Document {
  farmerId: mongoose.Types.ObjectId;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  debtToIncomeRatio: number;
  emergencyFund: number;
  investmentPortfolio: number;
  lastUpdated: Date;
  metadata: Record<string, any>;
}

// Financial Goal Interface
export interface IFinancialGoal extends Document {
  farmerId: mongoose.Types.ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  priority: 'high' | 'medium' | 'low';
  category: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

// Loan Application Schema
const loanApplicationSchema = new Schema<ILoanApplication>({
  farmerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1000
  },
  purpose: {
    type: String,
    required: true,
    enum: ['farm_equipment', 'seeds_fertilizers', 'land_expansion', 'livestock', 'other']
  },
  term: {
    type: Number,
    required: true,
    min: 6,
    max: 60
  },
  status: {
    type: String,
    required: true,
    enum: ['submitted', 'approved', 'rejected', 'disbursed', 'repaid'],
    default: 'submitted'
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  monthlyPayment: {
    type: Number,
    required: true
  },
  totalRepayment: {
    type: Number,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  disbursedAt: Date,
  dueDate: {
    type: Date,
    required: true
  },
  description: String,
  documents: [String],
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Insurance Policy Schema
const insurancePolicySchema = new Schema<IInsurancePolicy>({
  farmerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['crop', 'livestock', 'equipment', 'health', 'life']
  },
  coverage: {
    type: Number,
    required: true,
    min: 10000
  },
  premium: {
    type: Number,
    required: true,
    min: 100
  },
  deductible: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  crops: [{
    name: String,
    area: Number,
    coverage: Number
  }],
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Financial Health Schema
const financialHealthSchema = new Schema<IFinancialHealth>({
  farmerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  netWorth: {
    type: Number,
    required: true
  },
  monthlyIncome: {
    type: Number,
    required: true
  },
  monthlyExpenses: {
    type: Number,
    required: true
  },
  savingsRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  debtToIncomeRatio: {
    type: Number,
    required: true,
    min: 0
  },
  emergencyFund: {
    type: Number,
    required: true
  },
  investmentPortfolio: {
    type: Number,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Financial Goal Schema
const financialGoalSchema = new Schema<IFinancialGoal>({
  farmerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 1000
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  targetDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  category: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for better query performance
loanApplicationSchema.index({ farmerId: 1, status: 1 });
loanApplicationSchema.index({ status: 1, submittedAt: -1 });
insurancePolicySchema.index({ farmerId: 1, status: 1 });
insurancePolicySchema.index({ status: 1, endDate: 1 });
financialGoalSchema.index({ farmerId: 1, status: 1 });
financialGoalSchema.index({ targetDate: 1 });

// Export models
export const LoanApplication = mongoose.model<ILoanApplication>('LoanApplication', loanApplicationSchema);
export const InsurancePolicy = mongoose.model<IInsurancePolicy>('InsurancePolicy', insurancePolicySchema);
export const FinancialHealth = mongoose.model<IFinancialHealth>('FinancialHealth', financialHealthSchema);
export const FinancialGoal = mongoose.model<IFinancialGoal>('FinancialGoal', financialGoalSchema);
