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

// NEW ENDPOINTS - Image Recognition Advanced Features
router.get(
  '/analyses',
  authenticateJWT,
  authorizeRoles('farmer', 'partner', 'admin'),
  (req, res) => {
    // TODO: Implement image analyses controller
    res.json({
      success: true,
      data: [
        {
          id: "analysis_001",
          imageUrl: "/placeholder-image.jpg",
          fileName: "tomato_plant_001.jpg",
          uploadedAt: "2025-01-15T10:30:00Z",
          analysisType: "crop_health",
          status: "completed",
          results: {
            cropType: "Tomato",
            healthScore: 85,
            diseaseDetected: [],
            pestsIdentified: [],
            growthStage: "Flowering",
            qualityGrade: "A",
            recommendations: ["Continue current care routine", "Monitor for early blight"],
            confidence: 92,
            riskLevel: "low"
          },
          metadata: {
            fileSize: 2048576,
            dimensions: { width: 1920, height: 1080 },
            location: { lat: 6.5244, lng: 3.3792 }
          }
        }
      ]
    });
  }
);

router.get(
  '/stats',
  authenticateJWT,
  authorizeRoles('farmer', 'partner', 'admin'),
  (req, res) => {
    // TODO: Implement image recognition stats controller
    res.json({
      success: true,
      data: {
        totalAnalyses: 45,
        completed: 42,
        processing: 2,
        failed: 1,
        averageConfidence: 87.5,
        topCrops: ["Tomato", "Cassava", "Yam"],
        riskDistribution: { low: 35, medium: 8, high: 2 }
      }
    });
  }
);

export default router;

