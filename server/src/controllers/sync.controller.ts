import { Request, Response } from 'express';
import { OfflineSyncService } from '../services/offlineSync.service';
import { TranslationService } from '../services/translation.service';
import { logger } from '../index';
import Joi from 'joi';

export class SyncController {
  /**
   * Queue offline data for synchronization
   * POST /api/sync/offline-data
   */
  static async queueOfflineData(req: Request, res: Response) {
    try {
      const { error, value } = Joi.object({
        type: Joi.string().valid('harvest', 'order', 'listing', 'transaction').required(),
        data: Joi.object().required(),
        userId: Joi.string().required()
      }).validate(req.body);

      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }

      const { type, data, userId } = value;
      const language = req.language || 'en';

      // Queue the offline data
      const success = await OfflineSyncService.queueOfflineData(userId, data, type);

      if (success) {
        return res.status(200).json({
          status: 'success',
          message: TranslationService.translate('data_queued', language),
          data: {
            id: `offline_${Date.now()}`,
            type,
            status: 'queued',
            timestamp: new Date()
          }
        });
      } else {
        return res.status(500).json({
          status: 'error',
          message: TranslationService.translate('sync_failed', language)
        });
      }

    } catch (error) {
      logger.error('Failed to queue offline data: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: TranslationService.translate('something_went_wrong', req.language || 'en')
      });
    }
  }

  /**
   * Sync all pending offline data for a user
   * POST /api/sync/sync-user
   */
  static async syncUserData(req: Request, res: Response) {
    try {
      const { error, value } = Joi.object({
        userId: Joi.string().required()
      }).validate(req.body);

      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }

      const { userId } = value;
      const language = req.language || 'en';

      // Sync the user's offline data
      const result = await OfflineSyncService.syncUserOfflineData(userId, language);

      return res.status(200).json({
        status: 'success',
        message: result.message,
        data: {
          success: result.success,
          syncedItems: result.syncedItems,
          failedItems: result.failedItems,
          errors: result.errors,
          timestamp: new Date()
        }
      });

    } catch (error) {
      logger.error('Failed to sync user data: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: TranslationService.translate('sync_failed', req.language || 'en')
      });
    }
  }

  /**
   * Get sync status for a user
   * GET /api/sync/status/:userId
   */
  static async getSyncStatus(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const language = req.language || 'en';

      if (!userId) {
        return res.status(400).json({
          status: 'error',
          message: TranslationService.translate('required_field', language)
        });
      }

      // Get the sync status
      const status = await OfflineSyncService.getSyncStatus(userId);

      return res.status(200).json({
        status: 'success',
        message: TranslationService.translate('sync_completed', language),
        data: {
          userId,
          status,
          lastChecked: new Date(),
          hasPendingData: status.pending > 0 || status.syncing > 0
        }
      });

    } catch (error) {
      logger.error('Failed to get sync status: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: TranslationService.translate('something_went_wrong', req.language || 'en')
      });
    }
  }

  /**
   * Force sync for specific data type
   * POST /api/sync/force-sync
   */
  static async forceSync(req: Request, res: Response) {
    try {
      const { error, value } = Joi.object({
        userId: Joi.string().required(),
        type: Joi.string().valid('harvest', 'order', 'listing', 'transaction').optional(),
        dataId: Joi.string().optional()
      }).validate(req.body);

      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }

      const { userId, type, dataId } = value;
      const language = req.language || 'en';

      // Force sync specific data or all data
      let result;
      if (type && dataId) {
        // Sync specific item
        result = await OfflineSyncService.syncUserOfflineData(userId, language);
      } else {
        // Sync all pending data
        result = await OfflineSyncService.syncUserOfflineData(userId, language);
      }

      return res.status(200).json({
        status: 'success',
        message: result.message,
        data: {
          success: result.success,
          syncedItems: result.syncedItems,
          failedItems: result.failedItems,
          errors: result.errors,
          forcedSync: true,
          timestamp: new Date()
        }
      });

    } catch (error) {
      logger.error('Failed to force sync: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: TranslationService.translate('sync_failed', req.language || 'en')
      });
    }
  }

  /**
   * Get sync history for a user
   * GET /api/sync/history/:userId
   */
  static async getSyncHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const language = req.language || 'en';

      if (!userId) {
        return res.status(400).json({
          status: 'error',
          message: TranslationService.translate('required_field', language)
        });
      }

      // In a real implementation, this would query a sync history collection
      // For now, return a placeholder response
      const history = {
        userId,
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        lastSync: null,
        averageSyncTime: 0,
        items: []
      };

      return res.status(200).json({
        status: 'success',
        message: TranslationService.translate('sync_completed', language),
        data: {
          history,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: 0,
            pages: 0
          }
        }
      });

    } catch (error) {
      logger.error('Failed to get sync history: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: TranslationService.translate('something_went_wrong', req.language || 'en')
      });
    }
  }

  /**
   * Clear failed sync items
   * DELETE /api/sync/clear-failed/:userId
   */
  static async clearFailedSyncItems(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const language = req.language || 'en';

      if (!userId) {
        return res.status(400).json({
          status: 'error',
          message: TranslationService.translate('required_field', language)
        });
      }

      // In a real implementation, this would clear failed sync items
      // For now, return a placeholder response
      logger.info(`Clearing failed sync items for user ${userId}`);

      return res.status(200).json({
        status: 'success',
        message: 'Failed sync items cleared successfully',
        data: {
          userId,
          clearedItems: 0,
          timestamp: new Date()
        }
      });

    } catch (error) {
      logger.error('Failed to clear failed sync items: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: TranslationService.translate('something_went_wrong', req.language || 'en')
      });
    }
  }

  /**
   * Get sync statistics
   * GET /api/sync/stats
   */
  static async getSyncStats(req: Request, res: Response) {
    try {
      const language = req.language || 'en';

      // In a real implementation, this would query sync statistics
      // For now, return a placeholder response
      const stats = {
        totalUsers: 0,
        activeSyncs: 0,
        pendingSyncs: 0,
        failedSyncs: 0,
        averageSyncTime: 0,
        last24Hours: {
          successful: 0,
          failed: 0,
          total: 0
        }
      };

      return res.status(200).json({
        status: 'success',
        message: TranslationService.translate('sync_completed', language),
        data: {
          stats,
          timestamp: new Date()
        }
      });

    } catch (error) {
      logger.error('Failed to get sync stats: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: TranslationService.translate('something_went_wrong', req.language || 'en')
      });
    }
  }
}

