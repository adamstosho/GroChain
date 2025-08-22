import Joi from 'joi';

// Quality Standard Validation Schemas
export const createQualityStandardSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10).max(500),
  category: Joi.string().required().valid('crop', 'livestock', 'processed_food', 'equipment', 'other'),
  parameters: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    unit: Joi.string().required(),
    minValue: Joi.number().optional(),
    maxValue: Joi.number().optional(),
    targetValue: Joi.number().optional(),
    tolerance: Joi.number().optional()
  })).min(1).required(),
  complianceLevel: Joi.string().required().valid('basic', 'premium', 'organic', 'certified'),
  effectiveDate: Joi.date().iso().required(),
  expiryDate: Joi.date().iso().greater(Joi.ref('effectiveDate')).optional(),
  isActive: Joi.boolean().default(true),
  metadata: Joi.object().optional()
});

export const updateQualityStandardSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().min(10).max(500),
  category: Joi.string().valid('crop', 'livestock', 'processed_food', 'equipment', 'other'),
  parameters: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    unit: Joi.string().required(),
    minValue: Joi.number().optional(),
    maxValue: Joi.number().optional(),
    targetValue: Joi.number().optional(),
    tolerance: Joi.number().optional()
  })).min(1),
  complianceLevel: Joi.string().valid('basic', 'premium', 'organic', 'certified'),
  effectiveDate: Joi.date().iso(),
  expiryDate: Joi.date().iso().greater(Joi.ref('effectiveDate')),
  isActive: Joi.boolean(),
  metadata: Joi.object()
});

// Quality Inspection Validation Schemas
export const createQualityInspectionSchema = Joi.object({
  itemId: Joi.string().required(),
  standardId: Joi.string().required(),
  inspector: Joi.string().required(),
  inspectionDate: Joi.date().iso().required(),
  location: Joi.string().required(),
  results: Joi.array().items(Joi.object({
    parameter: Joi.string().required(),
    measuredValue: Joi.number().required(),
    unit: Joi.string().required(),
    isCompliant: Joi.boolean().required(),
    notes: Joi.string().optional()
  })).min(1).required(),
  overallResult: Joi.string().required().valid('pass', 'fail', 'conditional_pass'),
  notes: Joi.string().optional(),
  recommendations: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  metadata: Joi.object().optional()
});

export const updateQualityInspectionSchema = Joi.object({
  results: Joi.array().items(Joi.object({
    parameter: Joi.string().required(),
    measuredValue: Joi.number().required(),
    unit: Joi.string().required(),
    isCompliant: Joi.boolean().required(),
    notes: Joi.string().optional()
  })).min(1),
  overallResult: Joi.string().valid('pass', 'fail', 'conditional_pass'),
  notes: Joi.string(),
  recommendations: Joi.array().items(Joi.string()),
  images: Joi.array().items(Joi.string().uri()),
  metadata: Joi.object()
});

// Quality Test Validation Schemas
export const createQualityTestSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10).max(500),
  testType: Joi.string().required().valid('chemical', 'physical', 'microbiological', 'sensory', 'other'),
  methodology: Joi.string().required().min(20).max(1000),
  equipment: Joi.array().items(Joi.string()).optional(),
  reagents: Joi.array().items(Joi.string()).optional(),
  duration: Joi.number().positive().required(), // in minutes
  cost: Joi.number().positive().optional(),
  accuracy: Joi.number().min(0).max(100).optional(),
  isActive: Joi.boolean().default(true),
  metadata: Joi.object().optional()
});

export const updateQualityTestSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().min(10).max(500),
  testType: Joi.string().valid('chemical', 'physical', 'microbiological', 'sensory', 'other'),
  methodology: Joi.string().min(20).max(1000),
  equipment: Joi.array().items(Joi.string()),
  reagents: Joi.array().items(Joi.string()),
  duration: Joi.number().positive(),
  cost: Joi.number().positive(),
  accuracy: Joi.number().min(0).max(100),
  isActive: Joi.boolean(),
  metadata: Joi.object()
});

// Quality Certification Validation Schemas
export const createQualityCertificationSchema = Joi.object({
  itemId: Joi.string().required(),
  standardId: Joi.string().required(),
  certificationType: Joi.string().required().valid('organic', 'fair_trade', 'iso', 'halal', 'kosher', 'other'),
  certifyingBody: Joi.string().required(),
  certificateNumber: Joi.string().required(),
  issueDate: Joi.date().iso().required(),
  expiryDate: Joi.date().iso().greater(Joi.ref('issueDate')).required(),
  isActive: Joi.boolean().default(true),
  notes: Joi.string().optional(),
  metadata: Joi.object().optional()
});

export const updateQualityCertificationSchema = Joi.object({
  certificationType: Joi.string().valid('organic', 'fair_trade', 'iso', 'halal', 'kosher', 'other'),
  certifyingBody: Joi.string(),
  certificateNumber: Joi.string(),
  issueDate: Joi.date().iso(),
  expiryDate: Joi.date().iso().greater(Joi.ref('issueDate')),
  isActive: Joi.boolean(),
  notes: Joi.string(),
  metadata: Joi.object()
});

// Quality Training Validation Schemas
export const createQualityTrainingSchema = Joi.object({
  title: Joi.string().required().min(5).max(200),
  description: Joi.string().required().min(20).max(1000),
  category: Joi.string().required().valid('food_safety', 'quality_control', 'compliance', 'best_practices', 'other'),
  duration: Joi.number().positive().required(), // in hours
  difficulty: Joi.string().required().valid('beginner', 'intermediate', 'advanced'),
  materials: Joi.array().items(Joi.string()).optional(),
  prerequisites: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().default(true),
  metadata: Joi.object().optional()
});

export const updateQualityTrainingSchema = Joi.object({
  title: Joi.string().min(5).max(200),
  description: Joi.string().min(20).max(1000),
  category: Joi.string().valid('food_safety', 'quality_control', 'compliance', 'best_practices', 'other'),
  duration: Joi.number().positive(),
  difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced'),
  materials: Joi.array().items(Joi.string()),
  prerequisites: Joi.array().items(Joi.string()),
  isActive: Joi.boolean(),
  metadata: Joi.object()
});

// Quality Audit Validation Schemas
export const createQualityAuditSchema = Joi.object({
  title: Joi.string().required().min(5).max(200),
  description: Joi.string().required().min(20).max(1000),
  auditType: Joi.string().required().valid('internal', 'external', 'supplier', 'compliance', 'other'),
  scope: Joi.string().required().min(10).max(500),
  auditor: Joi.string().required(),
  auditee: Joi.string().required(),
  scheduledDate: Joi.date().iso().required(),
  estimatedDuration: Joi.number().positive().required(), // in hours
  checklist: Joi.array().items(Joi.object({
    item: Joi.string().required(),
    requirement: Joi.string().required(),
    isRequired: Joi.boolean().default(true)
  })).min(1).required(),
  isActive: Joi.boolean().default(true),
  metadata: Joi.object().optional()
});

export const updateQualityAuditSchema = Joi.object({
  title: Joi.string().min(5).max(200),
  description: Joi.string().min(20).max(1000),
  auditType: Joi.string().valid('internal', 'external', 'supplier', 'compliance', 'other'),
  scope: Joi.string().min(10).max(500),
  auditor: Joi.string(),
  auditee: Joi.string(),
  scheduledDate: Joi.date().iso(),
  estimatedDuration: Joi.number().positive(),
  checklist: Joi.array().items(Joi.object({
    item: Joi.string().required(),
    requirement: Joi.string().required(),
    isRequired: Joi.boolean().default(true)
  })).min(1),
  isActive: Joi.boolean(),
  metadata: Joi.object()
});

// Quality Compliance Check Schema
export const qualityComplianceCheckSchema = Joi.object({
  itemId: Joi.string().required(),
  standardId: Joi.string().required(),
  inspectionDate: Joi.date().iso().required(),
  inspector: Joi.string().required()
});

// Quality Report Generation Schema
export const qualityReportSchema = Joi.object({
  reportType: Joi.string().required().valid('compliance', 'performance', 'trends', 'summary', 'custom'),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  filters: Joi.object({
    category: Joi.string().optional(),
    standard: Joi.string().optional(),
    inspector: Joi.string().optional(),
    result: Joi.string().valid('pass', 'fail', 'conditional_pass').optional()
  }).optional(),
  format: Joi.string().valid('pdf', 'excel', 'csv', 'json').default('pdf'),
  includeCharts: Joi.boolean().default(true),
  metadata: Joi.object().optional()
});

// Quality Export Schema
export const qualityExportSchema = Joi.object({
  format: Joi.string().required().valid('csv', 'excel', 'json'),
  filters: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    category: Joi.string().optional(),
    standard: Joi.string().optional(),
    result: Joi.string().valid('pass', 'fail', 'conditional_pass').optional(),
    inspector: Joi.string().optional()
  }).optional(),
  fields: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional()
});

// Quality Alert Acknowledgment Schema
export const qualityAlertAcknowledgmentSchema = Joi.object({
  alertId: Joi.string().required(),
  acknowledgedBy: Joi.string().required(),
  acknowledgmentNotes: Joi.string().optional(),
  actionTaken: Joi.string().optional(),
  followUpRequired: Joi.boolean().default(false),
  followUpDate: Joi.date().iso().optional()
});

// Quality Training Assignment Schema
export const qualityTrainingAssignmentSchema = Joi.object({
  trainingId: Joi.string().required(),
  userIds: Joi.array().items(Joi.string()).min(1).required(),
  assignedBy: Joi.string().required(),
  dueDate: Joi.date().iso().optional(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  notes: Joi.string().optional()
});

// Quality Metrics Schema
export const qualityMetricsSchema = Joi.object({
  timeframe: Joi.string().required().valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  metrics: Joi.array().items(Joi.string().valid(
    'compliance_rate',
    'defect_rate',
    'rework_rate',
    'customer_satisfaction',
    'cost_of_quality',
    'training_completion'
  )).min(1).required(),
  groupBy: Joi.string().valid('category', 'standard', 'inspector', 'location').optional(),
  metadata: Joi.object().optional()
});

// Export all schemas
export const qualityValidation = {
  createQualityStandard: createQualityStandardSchema,
  updateQualityStandard: updateQualityStandardSchema,
  createQualityInspection: createQualityInspectionSchema,
  updateQualityInspection: updateQualityInspectionSchema,
  createQualityTest: createQualityTestSchema,
  updateQualityTest: updateQualityTestSchema,
  createQualityCertification: createQualityCertificationSchema,
  updateQualityCertification: updateQualityCertificationSchema,
  createQualityTraining: createQualityTrainingSchema,
  updateQualityTraining: updateQualityTrainingSchema,
  createQualityAudit: createQualityAuditSchema,
  updateQualityAudit: updateQualityAuditSchema,
  qualityComplianceCheck: qualityComplianceCheckSchema,
  qualityReport: qualityReportSchema,
  qualityExport: qualityExportSchema,
  qualityAlertAcknowledgment: qualityAlertAcknowledgmentSchema,
  qualityTrainingAssignment: qualityTrainingAssignmentSchema,
  qualityMetrics: qualityMetricsSchema
};
