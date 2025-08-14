import { Router } from 'express';
import { IoTController } from '../controllers/iot.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { detectLanguage, addLanguageInfo } from '../middlewares/language.middleware';

const router = Router();

// Apply middleware
router.use(detectLanguage);
router.use(addLanguageInfo);

// IoT Sensor Management
router.post('/sensors', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), IoTController.registerSensor);
router.get('/sensors', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), IoTController.getFarmerSensors);
router.get('/sensors/:sensorId', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), IoTController.getSensorById);
router.put('/sensors/:sensorId/data', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), IoTController.updateSensorData);
router.get('/sensors/:sensorId/readings', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), IoTController.getSensorReadings);
router.get('/sensors/:sensorId/alerts', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), IoTController.getSensorAlerts);
router.put('/sensors/:sensorId/alerts/:alertIndex/resolve', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), IoTController.resolveAlert);
router.put('/sensors/:sensorId/status', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), IoTController.updateSensorStatus);
router.delete('/sensors/:sensorId', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), IoTController.deleteSensor);

// Advanced ML Features
router.get('/sensors/:sensorId/maintenance', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), IoTController.getPredictiveMaintenance);
router.get('/sensors/:sensorId/anomalies', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), IoTController.detectAnomalies);

// Sensor Health & Analytics
router.get('/sensors/health/summary', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), IoTController.getSensorHealthSummary);

export default router;
