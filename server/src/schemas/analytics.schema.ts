import Joi from 'joi';

/**
 * Schema for analytics filters validation
 */
export const analyticsFiltersSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  period: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly').optional(),
  region: Joi.string().min(2).max(100).optional(),
  partnerId: Joi.string().hex().length(24).optional()
}).custom((value, helpers) => {
  const { startDate, endDate } = value;
  
  if (startDate && endDate && startDate >= endDate) {
    return helpers.error('any.invalid', { 
      message: 'startDate must be before endDate' 
    });
  }
  
  return value;
});

/**
 * Schema for analytics report generation
 */
export const analyticsReportSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  period: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly').required(),
  region: Joi.string().min(2).max(100).optional(),
  partnerId: Joi.string().hex().length(24).optional()
}).custom((value, helpers) => {
  const { startDate, endDate } = value;
  
  if (startDate >= endDate) {
    return helpers.error('any.invalid', { 
      message: 'startDate must be before endDate' 
    });
  }
  
  return value;
});

/**
 * Schema for analytics export
 */
export const analyticsExportSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  period: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly').optional(),
  region: Joi.string().min(2).max(100).optional(),
  format: Joi.string().valid('json', 'csv', 'excel').default('json')
}).custom((value, helpers) => {
  const { startDate, endDate } = value;
  
  if (startDate >= endDate) {
    return helpers.error('any.invalid', { 
      message: 'startDate must be before endDate' 
    });
  }
  
  return value;
});

/**
 * Schema for dashboard metrics request
 */
export const dashboardMetricsSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  period: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly').default('monthly'),
  region: Joi.string().min(2).max(100).optional(),
  partnerId: Joi.string().hex().length(24).optional(),
  includeTrends: Joi.boolean().default(true),
  includeBreakdown: Joi.boolean().default(true)
}).custom((value, helpers) => {
  const { startDate, endDate } = value;
  
  if (startDate && endDate && startDate >= endDate) {
    return helpers.error('any.invalid', { 
      message: 'startDate must be before endDate' 
    });
  }
  
  return value;
});

/**
 * Schema for regional analytics request
 */
export const regionalAnalyticsSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  regions: Joi.array().items(Joi.string().min(2).max(100)).min(1).max(10).optional(),
  period: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly').default('monthly'),
  metrics: Joi.array().items(Joi.string().valid(
    'farmers',
    'transactions',
    'harvests',
    'marketplace',
    'fintech',
    'impact',
    'partners',
    'weather'
  )).min(1).optional()
}).custom((value, helpers) => {
  const { startDate, endDate } = value;
  
  if (startDate >= endDate) {
    return helpers.error('any.invalid', { 
      message: 'startDate must be before endDate' 
    });
  }
  
  return value;
});

/**
 * Schema for comparative analytics
 */
export const comparativeAnalyticsSchema = Joi.object({
  baselineStartDate: Joi.date().iso().required(),
  baselineEndDate: Joi.date().iso().required(),
  currentStartDate: Joi.date().iso().required(),
  currentEndDate: Joi.date().iso().required(),
  region: Joi.string().min(2).max(100).optional(),
  metrics: Joi.array().items(Joi.string().valid(
    'farmers',
    'transactions',
    'harvests',
    'marketplace',
    'fintech',
    'impact',
    'partners',
    'weather'
  )).min(1).required()
}).custom((value, helpers) => {
  const { 
    baselineStartDate, 
    baselineEndDate, 
    currentStartDate, 
    currentEndDate 
  } = value;
  
  if (baselineStartDate >= baselineEndDate) {
    return helpers.error('any.invalid', { 
      message: 'baselineStartDate must be before baselineEndDate' 
    });
  }
  
  if (currentStartDate >= currentEndDate) {
    return helpers.error('any.invalid', { 
      message: 'currentStartDate must be before currentEndDate' 
    });
  }
  
  return value;
});

/**
 * Schema for analytics alert configuration
 */
export const analyticsAlertSchema = Joi.object({
  metric: Joi.string().valid(
    'farmers',
    'transactions',
    'harvests',
    'marketplace',
    'fintech',
    'impact',
    'partners',
    'weather'
  ).required(),
  threshold: Joi.number().min(0).required(),
  operator: Joi.string().valid('gt', 'gte', 'lt', 'lte', 'eq', 'ne').required(),
  region: Joi.string().min(2).max(100).optional(),
  period: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly').default('daily'),
  enabled: Joi.boolean().default(true),
  notificationChannels: Joi.array().items(Joi.string().valid('email', 'sms', 'push')).min(1).required()
});

/**
 * Schema for analytics dashboard configuration
 */
export const dashboardConfigSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  layout: Joi.object({
    widgets: Joi.array().items(Joi.object({
      id: Joi.string().required(),
      type: Joi.string().valid('chart', 'metric', 'table', 'map').required(),
      position: Joi.object({
        x: Joi.number().min(0).required(),
        y: Joi.number().min(0).required(),
        width: Joi.number().min(1).max(12).required(),
        height: Joi.number().min(1).max(12).required()
      }).required(),
      config: Joi.object({
        metric: Joi.string().valid(
          'farmers',
          'transactions',
          'harvests',
          'marketplace',
          'fintech',
          'impact',
          'partners',
          'weather'
        ).required(),
        chartType: Joi.string().valid('line', 'bar', 'pie', 'doughnut', 'area').optional(),
        timeRange: Joi.string().valid('1d', '7d', '30d', '90d', '1y').default('30d'),
        region: Joi.string().min(2).max(100).optional()
      }).required()
    })).min(1).max(20).required()
  }).required(),
  preferences: Joi.object({
    defaultPeriod: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly').default('monthly'),
    defaultRegion: Joi.string().min(2).max(100).optional(),
    refreshInterval: Joi.number().min(30).max(3600).default(300), // 5 minutes default
    theme: Joi.string().valid('light', 'dark', 'auto').default('auto')
  }).optional()
});

export default {
  analyticsFiltersSchema,
  analyticsReportSchema,
  analyticsExportSchema,
  dashboardMetricsSchema,
  regionalAnalyticsSchema,
  comparativeAnalyticsSchema,
  analyticsAlertSchema,
  dashboardConfigSchema
};
