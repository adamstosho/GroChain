import { Router } from 'express';
import { AdvancedMLController } from '../controllers/advancedML.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { detectLanguage, addLanguageInfo } from '../middlewares/language.middleware';

const router = Router();

// Apply middleware
router.use(detectLanguage);
router.use(addLanguageInfo);

// Predictive Maintenance & Anomaly Detection
router.get('/sensors/:sensorId/maintenance', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), AdvancedMLController.getPredictiveMaintenance);
router.get('/sensors/:sensorId/anomalies', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), AdvancedMLController.detectAnomalies);

// Optimization Algorithms
router.get('/optimize/irrigation', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), AdvancedMLController.optimizeIrrigation);
router.get('/optimize/fertilizer', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), AdvancedMLController.optimizeFertilizer);
router.get('/optimize/harvest', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), AdvancedMLController.optimizeHarvest);
router.get('/optimize/report', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), AdvancedMLController.getOptimizationReport);

// Insights & Analytics
router.get('/insights/sensor-health', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), AdvancedMLController.getSensorHealthInsights);
router.get('/insights/efficiency-score', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), AdvancedMLController.getFarmingEfficiencyScore);
router.get('/insights/predictive', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), AdvancedMLController.getPredictiveInsights);

// ML Model Performance
router.get('/models/performance', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), AdvancedMLController.getMLModelPerformance);

export default router;

