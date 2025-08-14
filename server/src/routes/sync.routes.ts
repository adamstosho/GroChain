import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { detectLanguage, addLanguageInfo } from '../middlewares/language.middleware';

const router = Router();

// Apply language detection to all sync routes
router.use(detectLanguage);
router.use(addLanguageInfo);

// Queue offline data for synchronization
router.post('/offline-data', authenticateJWT, SyncController.queueOfflineData);

// Sync user's offline data
router.post('/sync-user', authenticateJWT, SyncController.syncUserData);

// Get sync status for a user
router.get('/status/:userId', authenticateJWT, SyncController.getSyncStatus);

// Force sync for specific data
router.post('/force-sync', authenticateJWT, SyncController.forceSync);

// Get sync history for a user
router.get('/history/:userId', authenticateJWT, SyncController.getSyncHistory);

// Clear failed sync items
router.delete('/clear-failed/:userId', authenticateJWT, SyncController.clearFailedSyncItems);

// Get sync statistics (admin only)
router.get('/stats', authenticateJWT, SyncController.getSyncStats);

export default router;
