import { Router } from 'express';
import { ImageRecognitionController } from '../controllers/imageRecognition.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { detectLanguage, addLanguageInfo } from '../middlewares/language.middleware';

const router = Router();

// Apply middleware
router.use(detectLanguage);
router.use(addLanguageInfo);

// Crop Image Analysis
router.post('/analyze', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), ImageRecognitionController.analyzeCropImage);
router.get('/analyses', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), ImageRecognitionController.getFarmerAnalyses);
router.get('/analyses/:analysisId', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), ImageRecognitionController.getCropAnalysis);
router.get('/analyses/crop/:cropType', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), ImageRecognitionController.getAnalysesByCropType);
router.get('/analyses/risk/high', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), ImageRecognitionController.getHighRiskAnalyses);

// Analysis Management
router.put('/analyses/:analysisId/status', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), ImageRecognitionController.updateAnalysisStatus);
router.post('/analyses/:analysisId/recommendations', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), ImageRecognitionController.addRecommendation);
router.delete('/analyses/:analysisId', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), ImageRecognitionController.deleteCropAnalysis);

export default router;

