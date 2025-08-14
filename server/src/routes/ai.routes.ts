import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { detectLanguage, addLanguageInfo } from '../middlewares/language.middleware';

const router = Router();

// Apply language middleware to all AI routes
router.use(detectLanguage);
router.use(addLanguageInfo);

// AI Crop Recommendations
router.post('/crop-recommendations', 
  authenticateJWT, 
  authorizeRoles('farmer', 'partner', 'admin'), 
  AIController.getCropRecommendations
);

// AI Yield Prediction
router.post('/yield-prediction', 
  authenticateJWT, 
  authorizeRoles('farmer', 'partner', 'admin'), 
  AIController.getYieldPrediction
);

// AI Market Insights
router.get('/market-insights', 
  authenticateJWT, 
  authorizeRoles('farmer', 'partner', 'admin'), 
  AIController.getMarketInsights
);

// AI Farming Insights
router.get('/farming-insights', 
  authenticateJWT, 
  authorizeRoles('farmer', 'partner', 'admin'), 
  AIController.getFarmingInsights
);

// AI Farming Recommendations
router.get('/farming-recommendations', 
  authenticateJWT, 
  authorizeRoles('farmer', 'partner', 'admin'), 
  AIController.getFarmingRecommendations
);

// AI Analytics Dashboard
router.get('/analytics-dashboard', 
  authenticateJWT, 
  authorizeRoles('farmer', 'partner', 'admin'), 
  AIController.getAnalyticsDashboard
);

// AI Seasonal Calendar
router.get('/seasonal-calendar', 
  authenticateJWT, 
  authorizeRoles('farmer', 'partner', 'admin'), 
  AIController.getSeasonalCalendar
);

// AI Weather Prediction
router.get('/weather-prediction', 
  authenticateJWT, 
  authorizeRoles('farmer', 'partner', 'admin'), 
  AIController.getWeatherPrediction
);

// AI Market Trend Analysis
router.get('/market-trends', 
  authenticateJWT, 
  authorizeRoles('farmer', 'partner', 'admin'), 
  AIController.getMarketTrendAnalysis
);

// AI Risk Assessment
router.post('/risk-assessment', 
  authenticateJWT, 
  authorizeRoles('farmer', 'partner', 'admin'), 
  AIController.getRiskAssessment
);

// AI Comprehensive Predictive Insights
router.post('/predictive-insights', 
  authenticateJWT, 
  authorizeRoles('farmer', 'partner', 'admin'), 
  AIController.getPredictiveInsights
);

export default router;
