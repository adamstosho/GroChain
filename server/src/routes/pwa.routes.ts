import { Router } from 'express';
import { PWAController } from '../controllers/pwa.controller';
import { detectLanguage, addLanguageInfo } from '../middlewares/language.middleware';

const router = Router();

// Apply language detection to all PWA routes
router.use(detectLanguage);
router.use(addLanguageInfo);

// PWA Manifest
router.get('/manifest', PWAController.getPWAManifest);

// Service Worker
router.get('/service-worker', PWAController.getServiceWorker);

// Offline Page
router.get('/offline', PWAController.getOfflinePage);

// Installation Instructions
router.get('/install', PWAController.getInstallInstructions);

export default router;
