import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { 
  analyticsFiltersSchema, 
  analyticsExportSchema, 
  comparativeAnalyticsSchema, 
  regionalAnalyticsSchema 
} from '../schemas/analytics.schema';

const router = Router();

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get comprehensive dashboard metrics
 * @access  Private (Admin, Partner)
 */
router.get(
  '/dashboard',
  authenticate,
  authorize(['admin', 'partner']),
  validateRequest(analyticsFiltersSchema, 'query'),
  analyticsController.getDashboardMetrics
);

/**
 * @route   GET /api/analytics/farmers
 * @desc    Get farmer analytics
 * @access  Private (Admin, Partner)
 */
router.get(
  '/farmers',
  authenticate,
  authorize(['admin', 'partner']),
  validateRequest(analyticsFiltersSchema, 'query'),
  analyticsController.getFarmerAnalytics
);

/**
 * @route   GET /api/analytics/transactions
 * @desc    Get transaction analytics
 * @access  Private (Admin, Partner)
 */
router.get(
  '/transactions',
  authenticate,
  authorize(['admin', 'partner']),
  validateRequest(analyticsFiltersSchema, 'query'),
  analyticsController.getTransactionAnalytics
);

/**
 * @route   GET /api/analytics/harvests
 * @desc    Get harvest analytics
 * @access  Private (Admin, Partner)
 */
router.get(
  '/harvests',
  authenticate,
  authorize(['admin', 'partner']),
  validateRequest(analyticsFiltersSchema, 'query'),
  analyticsController.getHarvestAnalytics
);

/**
 * @route   GET /api/analytics/marketplace
 * @desc    Get marketplace analytics
 * @access  Private (Admin, Partner)
 */
router.get(
  '/marketplace',
  authenticate,
  authorize(['admin', 'partner']),
  validateRequest(analyticsFiltersSchema, 'query'),
  analyticsController.getMarketplaceAnalytics
);

/**
 * @route   GET /api/analytics/fintech
 * @desc    Get fintech analytics
 * @access  Private (Admin, Partner)
 */
router.get(
  '/fintech',
  authenticate,
  authorize(['admin', 'partner']),
  validateRequest(analyticsFiltersSchema, 'query'),
  analyticsController.getFintechAnalytics
);

/**
 * @route   GET /api/analytics/impact
 * @desc    Get impact analytics
 * @access  Private (Admin, Partner)
 */
router.get(
  '/impact',
  authenticate,
  authorize(['admin', 'partner']),
  validateRequest(analyticsFiltersSchema, 'query'),
  analyticsController.getImpactAnalytics
);

/**
 * @route   GET /api/analytics/partners
 * @desc    Get partner analytics
 * @access  Private (Admin, Partner)
 */
router.get(
  '/partners',
  authenticate,
  authorize(['admin', 'partner']),
  validateRequest(analyticsFiltersSchema, 'query'),
  analyticsController.getPartnerAnalytics
);

/**
 * @route   GET /api/analytics/weather
 * @desc    Get weather analytics
 * @access  Private (Admin, Partner)
 */
router.get(
  '/weather',
  authenticate,
  authorize(['admin', 'partner']),
  validateRequest(analyticsFiltersSchema, 'query'),
  analyticsController.getWeatherAnalytics
);

/**
 * @route   POST /api/analytics/report
 * @desc    Generate analytics report
 * @access  Private (Admin)
 */
router.post(
  '/report',
  authenticate,
  authorize(['admin']),
  validateRequest(analyticsFiltersSchema, 'body'),
  analyticsController.generateReport
);

/**
 * @route   GET /api/analytics/reports
 * @desc    Get analytics reports
 * @access  Private (Admin, Partner)
 */
router.get(
  '/reports',
  authenticate,
  authorize(['admin', 'partner']),
  validateRequest(analyticsFiltersSchema, 'query'),
  analyticsController.getReports
);

/**
 * @route   GET /api/analytics/export
 * @desc    Export analytics data for government/NGO reporting
 * @access  Private (Admin)
 */
router.get(
  '/export',
  authenticate,
  authorize(['admin']),
  validateRequest(analyticsExportSchema, 'query'),
  analyticsController.exportAnalyticsData
);

/**
 * @route   POST /api/analytics/compare
 * @desc    Get comparative analytics between two periods
 * @access  Private (Admin, Partner)
 */
router.post(
  '/compare',
  authenticate,
  authorize(['admin', 'partner']),
  validateRequest(comparativeAnalyticsSchema, 'body'),
  analyticsController.getComparativeAnalytics
);

/**
 * @route   POST /api/analytics/regional
 * @desc    Get regional analytics comparison
 * @access  Private (Admin, Partner)
 */
router.post(
  '/regional',
  authenticate,
  authorize(['admin', 'partner']),
  validateRequest(regionalAnalyticsSchema, 'body'),
  analyticsController.getRegionalAnalytics
);

/**
 * @route   GET /api/analytics/predictive
 * @desc    Get predictive analytics for forecasting
 * @access  Private (Admin, Partner)
 */
router.get(
  '/predictive',
  authenticate,
  authorize(['admin', 'partner']),
  validateRequest(analyticsFiltersSchema, 'query'),
  analyticsController.getPredictiveAnalytics
);

/**
 * @route   GET /api/analytics/summary
 * @desc    Get analytics summary for quick overview
 * @access  Private (Admin, Partner)
 */
router.get(
  '/summary',
  authenticate,
  authorize(['admin', 'partner']),
  validateRequest(analyticsFiltersSchema, 'query'),
  analyticsController.getAnalyticsSummary
);

export default router;
