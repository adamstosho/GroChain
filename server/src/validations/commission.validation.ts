import Joi from 'joi';

// Commission CRUD Validation Schemas
export const createCommissionSchema = Joi.object({
  partnerId: Joi.string().required(),
  transactionId: Joi.string().required(),
  transactionType: Joi.string().required().valid('marketplace_sale', 'referral', 'subscription', 'service_fee', 'other'),
  amount: Joi.number().positive().required(),
  commissionRate: Joi.number().min(0).max(100).required(),
  commissionAmount: Joi.number().positive().required(),
  currency: Joi.string().default('NGN'),
  status: Joi.string().valid('pending', 'approved', 'paid', 'cancelled', 'disputed').default('pending'),
  dueDate: Joi.date().iso().required(),
  description: Joi.string().required().min(10).max(500),
  metadata: Joi.object().optional()
});

export const updateCommissionSchema = Joi.object({
  amount: Joi.number().positive(),
  commissionRate: Joi.number().min(0).max(100),
  commissionAmount: Joi.number().positive(),
  status: Joi.string().valid('pending', 'approved', 'paid', 'cancelled', 'disputed'),
  dueDate: Joi.date().iso(),
  description: Joi.string().min(10).max(500),
  metadata: Joi.object()
});

export const getCommissionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  partnerId: Joi.string().optional(),
  status: Joi.string().valid('pending', 'approved', 'paid', 'cancelled', 'disputed').optional(),
  transactionType: Joi.string().valid('marketplace_sale', 'referral', 'subscription', 'service_fee', 'other').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  minAmount: Joi.number().positive().optional(),
  maxAmount: Joi.number().positive().optional(),
  sortBy: Joi.string().valid('createdAt', 'dueDate', 'amount', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Commission Withdrawal Validation Schemas
export const createWithdrawalSchema = Joi.object({
  partnerId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  paymentMethod: Joi.string().required().valid('bank_transfer', 'mobile_money', 'crypto', 'check'),
  bankDetails: Joi.object({
    accountNumber: Joi.string().when('paymentMethod', {
      is: 'bank_transfer',
      then: Joi.required()
    }),
    accountName: Joi.string().when('paymentMethod', {
      is: 'bank_transfer',
      then: Joi.required()
    }),
    bankName: Joi.string().when('paymentMethod', {
      is: 'bank_transfer',
      then: Joi.required()
    }),
    swiftCode: Joi.string().optional(),
    routingNumber: Joi.string().optional()
  }).optional(),
  mobileMoneyDetails: Joi.object({
    provider: Joi.string().when('paymentMethod', {
      is: 'mobile_money',
      then: Joi.required()
    }),
    phoneNumber: Joi.string().when('paymentMethod', {
      is: 'mobile_money',
      then: Joi.required()
    }),
    accountName: Joi.string().when('paymentMethod', {
      is: 'mobile_money',
      then: Joi.required()
    })
  }).optional(),
  cryptoDetails: Joi.object({
    walletAddress: Joi.string().when('paymentMethod', {
      is: 'crypto',
      then: Joi.required()
    }),
    network: Joi.string().when('paymentMethod', {
      is: 'crypto',
      then: Joi.required()
    }),
    currency: Joi.string().when('paymentMethod', {
      is: 'crypto',
      then: Joi.required()
    })
  }).optional(),
  notes: Joi.string().optional(),
  metadata: Joi.object().optional()
});

export const updateWithdrawalSchema = Joi.object({
  status: Joi.string().required().valid('pending', 'processing', 'completed', 'failed', 'cancelled'),
  transactionId: Joi.string().optional(),
  processedAt: Joi.date().iso().optional(),
  failureReason: Joi.string().optional(),
  notes: Joi.string().optional()
});

export const getWithdrawalsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  partnerId: Joi.string().optional(),
  status: Joi.string().valid('pending', 'processing', 'completed', 'failed', 'cancelled').optional(),
  paymentMethod: Joi.string().valid('bank_transfer', 'mobile_money', 'crypto', 'check').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  minAmount: Joi.number().positive().optional(),
  maxAmount: Joi.number().positive().optional(),
  sortBy: Joi.string().valid('createdAt', 'processedAt', 'amount', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Commission Tier Validation Schemas
export const createCommissionTierSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().optional().max(500),
  minTransactions: Joi.number().integer().min(0).required(),
  maxTransactions: Joi.number().integer().min(0).optional(),
  minAmount: Joi.number().positive().required(),
  maxAmount: Joi.number().positive().optional(),
  commissionRate: Joi.number().min(0).max(100).required(),
  bonusRate: Joi.number().min(0).max(100).default(0),
  benefits: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().default(true),
  metadata: Joi.object().optional()
});

export const updateCommissionTierSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().max(500),
  minTransactions: Joi.number().integer().min(0),
  maxTransactions: Joi.number().integer().min(0),
  minAmount: Joi.number().positive(),
  maxAmount: Joi.number().positive(),
  commissionRate: Joi.number().min(0).max(100),
  bonusRate: Joi.number().min(0).max(100),
  benefits: Joi.array().items(Joi.string()),
  isActive: Joi.boolean(),
  metadata: Joi.object()
});

export const getCommissionTiersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  isActive: Joi.boolean().optional(),
  sortBy: Joi.string().valid('minTransactions', 'minAmount', 'commissionRate', 'createdAt').default('minTransactions'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});

// Commission Calculation Validation Schemas
export const calculateCommissionSchema = Joi.object({
  partnerId: Joi.string().required(),
  transactionAmount: Joi.number().positive().required(),
  transactionType: Joi.string().required().valid('marketplace_sale', 'referral', 'subscription', 'service_fee', 'other'),
  currency: Joi.string().default('NGN'),
  metadata: Joi.object().optional()
});

export const bulkCommissionCalculationSchema = Joi.object({
  transactions: Joi.array().items(Joi.object({
    partnerId: Joi.string().required(),
    transactionAmount: Joi.number().positive().required(),
    transactionType: Joi.string().required().valid('marketplace_sale', 'referral', 'subscription', 'service_fee', 'other'),
    currency: Joi.string().default('NGN'),
    metadata: Joi.object().optional()
  })).min(1).required()
});

// Commission Approval & Processing Validation Schemas
export const approveCommissionSchema = Joi.object({
  commissionId: Joi.string().required(),
  approvedBy: Joi.string().required(),
  notes: Joi.string().optional(),
  effectiveDate: Joi.date().iso().optional()
});

export const bulkApproveCommissionsSchema = Joi.object({
  commissionIds: Joi.array().items(Joi.string()).min(1).required(),
  approvedBy: Joi.string().required(),
  notes: Joi.string().optional(),
  effectiveDate: Joi.date().iso().optional()
});

export const processCommissionPaymentSchema = Joi.object({
  commissionId: Joi.string().required(),
  paymentMethod: Joi.string().required().valid('bank_transfer', 'mobile_money', 'crypto', 'check'),
  transactionId: Joi.string().optional(),
  processedBy: Joi.string().required(),
  notes: Joi.string().optional()
});

// Commission Dispute Validation Schemas
export const createDisputeSchema = Joi.object({
  commissionId: Joi.string().required(),
  reason: Joi.string().required().min(10).max(500),
  evidence: Joi.array().items(Joi.string().uri()).optional(),
  requestedAmount: Joi.number().positive().optional(),
  notes: Joi.string().optional()
});

export const updateDisputeSchema = Joi.object({
  status: Joi.string().required().valid('open', 'under_review', 'resolved', 'closed'),
  resolution: Joi.string().optional(),
  resolvedAmount: Joi.number().positive().optional(),
  resolvedBy: Joi.string().optional(),
  notes: Joi.string().optional()
});

export const getDisputesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('open', 'under_review', 'resolved', 'closed').optional(),
  partnerId: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Commission Analytics Validation Schemas
export const getCommissionAnalyticsSchema = Joi.object({
  timeframe: Joi.string().required().valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  metrics: Joi.array().items(Joi.string().valid(
    'total_commissions',
    'total_paid',
    'total_pending',
    'average_commission',
    'conversion_rate',
    'dispute_rate'
  )).min(1).required(),
  groupBy: Joi.string().valid('day', 'week', 'month', 'quarter', 'year', 'partner', 'transaction_type').optional(),
  filters: Joi.object({
    partnerId: Joi.string().optional(),
    transactionType: Joi.string().valid('marketplace_sale', 'referral', 'subscription', 'service_fee', 'other').optional(),
    status: Joi.string().valid('pending', 'approved', 'paid', 'cancelled', 'disputed').optional(),
    minAmount: Joi.number().positive().optional(),
    maxAmount: Joi.number().positive().optional()
  }).optional()
});

// Commission Reports Validation Schemas
export const generateCommissionReportSchema = Joi.object({
  reportType: Joi.string().required().valid('summary', 'partner', 'transaction', 'payment', 'dispute', 'custom'),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  format: Joi.string().valid('pdf', 'excel', 'csv', 'json').default('pdf'),
  filters: Joi.object({
    partnerId: Joi.string().optional(),
    transactionType: Joi.string().valid('marketplace_sale', 'referral', 'subscription', 'service_fee', 'other').optional(),
    status: Joi.string().valid('pending', 'approved', 'paid', 'cancelled', 'disputed').optional(),
    minAmount: Joi.number().positive().optional(),
    maxAmount: Joi.number().positive().optional()
  }).optional(),
  includeCharts: Joi.boolean().default(true),
  metadata: Joi.object().optional()
});

// Commission Export Validation Schemas
export const exportCommissionsSchema = Joi.object({
  format: Joi.string().required().valid('csv', 'excel', 'json'),
  filters: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    partnerId: Joi.string().optional(),
    status: Joi.string().valid('pending', 'approved', 'paid', 'cancelled', 'disputed').optional(),
    transactionType: Joi.string().valid('marketplace_sale', 'referral', 'subscription', 'service_fee', 'other').optional()
  }).optional(),
  fields: Joi.array().items(Joi.string()).optional(),
  includeMetadata: Joi.boolean().default(false),
  metadata: Joi.object().optional()
});

// Commission Search Validation Schemas
export const searchCommissionsSchema = Joi.object({
  query: Joi.string().required().min(2),
  filters: Joi.object({
    partnerId: Joi.string().optional(),
    status: Joi.string().valid('pending', 'approved', 'paid', 'cancelled', 'disputed').optional(),
    transactionType: Joi.string().valid('marketplace_sale', 'referral', 'subscription', 'service_fee', 'other').optional(),
    dateRange: Joi.object({
      start: Joi.date().iso().optional(),
      end: Joi.date().iso().optional()
    }).optional()
  }).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// Commission Bulk Operations Validation Schemas
export const bulkCommissionOperationsSchema = Joi.object({
  commissionIds: Joi.array().items(Joi.string()).min(1).required(),
  operation: Joi.string().required().valid('approve', 'reject', 'process_payment', 'cancel', 'update_status'),
  data: Joi.object().optional(),
  notes: Joi.string().optional()
});

// Export all schemas
export const commissionValidation = {
  createCommission: createCommissionSchema,
  updateCommission: updateCommissionSchema,
  getCommissions: getCommissionsSchema,
  createWithdrawal: createWithdrawalSchema,
  updateWithdrawal: updateWithdrawalSchema,
  getWithdrawals: getWithdrawalsSchema,
  createCommissionTier: createCommissionTierSchema,
  updateCommissionTier: updateCommissionTierSchema,
  getCommissionTiers: getCommissionTiersSchema,
  calculateCommission: calculateCommissionSchema,
  bulkCommissionCalculation: bulkCommissionCalculationSchema,
  approveCommission: approveCommissionSchema,
  bulkApproveCommissions: bulkApproveCommissionsSchema,
  processCommissionPayment: processCommissionPaymentSchema,
  createDispute: createDisputeSchema,
  updateDispute: updateDisputeSchema,
  getDisputes: getDisputesSchema,
  getCommissionAnalytics: getCommissionAnalyticsSchema,
  generateCommissionReport: generateCommissionReportSchema,
  exportCommissions: exportCommissionsSchema,
  searchCommissions: searchCommissionsSchema,
  bulkCommissionOperations: bulkCommissionOperationsSchema
};
