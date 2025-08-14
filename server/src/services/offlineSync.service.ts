import { User } from '../models/user.model';
import { Harvest } from '../models/harvest.model';
import { Order } from '../models/order.model';
import { Listing } from '../models/listing.model';
import { Transaction } from '../models/transaction.model';
import { logger } from '../index';
import { TranslationService } from './translation.service';

export interface OfflineDataItem {
  id: string;
  type: 'harvest' | 'order' | 'listing' | 'transaction';
  data: any;
  timestamp: Date;
  userId: string;
  syncStatus: 'pending' | 'syncing' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
}

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  failedItems: number;
  errors: string[];
  message: string;
}

export class OfflineSyncService {
  private static readonly MAX_RETRIES = 3;
  private static readonly SYNC_BATCH_SIZE = 50;

  /**
   * Queue offline data for synchronization
   * @param userId - User ID
   * @param data - Data to sync
   * @param type - Type of data
   * @returns Promise<boolean>
   */
  static async queueOfflineData(
    userId: string,
    data: any,
    type: OfflineDataItem['type']
  ): Promise<boolean> {
    try {
      // Store in temporary collection or cache for sync
      const offlineItem: OfflineDataItem = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: new Date(),
        userId,
        syncStatus: 'pending',
        retryCount: 0,
        maxRetries: this.MAX_RETRIES
      };

      // For now, we'll store in memory cache
      // In production, use Redis or database collection
      await this.storeOfflineItem(offlineItem);

      logger.info(`Offline data queued for user ${userId}, type: ${type}`);
      return true;
    } catch (error) {
      logger.error(`Failed to queue offline data: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Sync all pending offline data for a user
   * @param userId - User ID
   * @param language - User language for messages
   * @returns Promise<SyncResult>
   */
  static async syncUserOfflineData(userId: string, language: string = 'en'): Promise<SyncResult> {
    try {
      const pendingItems = await this.getPendingOfflineItems(userId);
      
      if (pendingItems.length === 0) {
        return {
          success: true,
          syncedItems: 0,
          failedItems: 0,
          errors: [],
          message: TranslationService.translate('sync_completed', language)
        };
      }

      let syncedItems = 0;
      let failedItems = 0;
      const errors: string[] = [];

      // Process items in batches
      for (let i = 0; i < pendingItems.length; i += this.SYNC_BATCH_SIZE) {
        const batch = pendingItems.slice(i, i + this.SYNC_BATCH_SIZE);
        
        for (const item of batch) {
          try {
            // Mark as syncing
            await this.updateSyncStatus(item.id, 'syncing');
            
            // Process the item based on type
            const success = await this.processOfflineItem(item);
            
            if (success) {
              await this.updateSyncStatus(item.id, 'completed');
              syncedItems++;
            } else {
              await this.handleSyncFailure(item);
              failedItems++;
              errors.push(`Failed to sync ${item.type} item ${item.id}`);
            }
          } catch (error) {
            await this.handleSyncFailure(item);
            failedItems++;
            errors.push(`Error syncing ${item.type} item ${item.id}: ${(error as Error).message}`);
          }
        }
      }

      const result: SyncResult = {
        success: failedItems === 0,
        syncedItems,
        failedItems,
        errors,
        message: failedItems === 0 
          ? TranslationService.translate('sync_completed', language)
          : TranslationService.translate('sync_failed', language)
      };

      logger.info(`Sync completed for user ${userId}: ${syncedItems} synced, ${failedItems} failed`);
      return result;

    } catch (error) {
      logger.error(`Sync failed for user ${userId}: ${(error as Error).message}`);
      return {
        success: false,
        syncedItems: 0,
        failedItems: 0,
        errors: [(error as Error).message],
        message: TranslationService.translate('sync_failed', language)
      };
    }
  }

  /**
   * Process individual offline data item
   * @param item - Offline data item to process
   * @returns Promise<boolean>
   */
  private static async processOfflineItem(item: OfflineDataItem): Promise<boolean> {
    try {
      switch (item.type) {
        case 'harvest':
          return await this.processHarvestItem(item);
        case 'order':
          return await this.processOrderItem(item);
        case 'listing':
          return await this.processListingItem(item);
        case 'transaction':
          return await this.processTransactionItem(item);
        default:
          logger.warn(`Unknown offline data type: ${item.type}`);
          return false;
      }
    } catch (error) {
      logger.error(`Failed to process offline item ${item.id}: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Process offline harvest data
   * @param item - Offline harvest item
   * @returns Promise<boolean>
   */
  private static async processHarvestItem(item: OfflineDataItem): Promise<boolean> {
    try {
      const harvestData = item.data;
      
      // Validate harvest data
      if (!harvestData.cropType || !harvestData.quantity || !harvestData.location) {
        throw new Error('Invalid harvest data');
      }

      // Check if harvest already exists
      const existingHarvest = await Harvest.findOne({
        batchId: harvestData.batchId,
        farmer: item.userId
      });

      if (existingHarvest) {
        // Update existing harvest
        await Harvest.findByIdAndUpdate(existingHarvest._id, harvestData);
      } else {
        // Create new harvest
        const harvest = new Harvest({
          ...harvestData,
          farmer: item.userId,
          createdAt: item.timestamp,
          updatedAt: item.timestamp
        });
        await harvest.save();
      }

      return true;
    } catch (error) {
      logger.error(`Failed to process harvest item: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Process offline order data
   * @param item - Offline order item
   * @returns Promise<boolean>
   */
  private static async processOrderItem(item: OfflineDataItem): Promise<boolean> {
    try {
      const orderData = item.data;
      
      // Validate order data
      if (!orderData.listing || !orderData.quantity || !orderData.buyer) {
        throw new Error('Invalid order data');
      }

      // Check if order already exists
      const existingOrder = await Order.findOne({
        listing: orderData.listing,
        buyer: item.userId,
        createdAt: { $gte: new Date(item.timestamp.getTime() - 24 * 60 * 60 * 1000) } // Within 24 hours
      });

      if (existingOrder) {
        // Update existing order
        await Order.findByIdAndUpdate(existingOrder._id, orderData);
      } else {
        // Create new order
        const order = new Order({
          ...orderData,
          buyer: item.userId,
          createdAt: item.timestamp,
          updatedAt: item.timestamp
        });
        await order.save();
      }

      return true;
    } catch (error) {
      logger.error(`Failed to process order item: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Process offline listing data
   * @param item - Offline listing item
   * @returns Promise<boolean>
   */
  private static async processListingItem(item: OfflineDataItem): Promise<boolean> {
    try {
      const listingData = item.data;
      
      // Validate listing data
      if (!listingData.product || !listingData.price || !listingData.quantity) {
        throw new Error('Invalid listing data');
      }

      // Check if listing already exists
      const existingListing = await Listing.findOne({
        product: listingData.product,
        farmer: item.userId,
        createdAt: { $gte: new Date(item.timestamp.getTime() - 24 * 60 * 60 * 1000) } // Within 24 hours
      });

      if (existingListing) {
        // Update existing listing
        await Listing.findByIdAndUpdate(existingListing._id, listingData);
      } else {
        // Create new listing
        const listing = new Listing({
          ...listingData,
          farmer: item.userId,
          createdAt: item.timestamp,
          updatedAt: item.timestamp
        });
        await listing.save();
      }

      return true;
    } catch (error) {
      logger.error(`Failed to process listing item: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Process offline transaction data
   * @param item - Offline transaction item
   * @returns Promise<boolean>
   */
  private static async processTransactionItem(item: OfflineDataItem): Promise<boolean> {
    try {
      const transactionData = item.data;
      
      // Validate transaction data
      if (!transactionData.amount || !transactionData.type) {
        throw new Error('Invalid transaction data');
      }

      // Check if transaction already exists
      const existingTransaction = await Transaction.findOne({
        reference: transactionData.reference,
        userId: item.userId
      });

      if (existingTransaction) {
        // Update existing transaction
        await Transaction.findByIdAndUpdate(existingTransaction._id, transactionData);
      } else {
        // Create new transaction
        const transaction = new Transaction({
          ...transactionData,
          userId: item.userId,
          createdAt: item.timestamp,
          updatedAt: item.timestamp
        });
        await transaction.save();
      }

      return true;
    } catch (error) {
      logger.error(`Failed to process transaction item: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Handle sync failure
   * @param item - Failed offline item
   */
  private static async handleSyncFailure(item: OfflineDataItem): Promise<void> {
    try {
      if (item.retryCount < item.maxRetries) {
        // Increment retry count and mark as pending
        await this.updateRetryCount(item.id, item.retryCount + 1);
        await this.updateSyncStatus(item.id, 'pending');
      } else {
        // Max retries reached, mark as failed
        await this.updateSyncStatus(item.id, 'failed');
        logger.warn(`Max retries reached for offline item ${item.id}`);
      }
    } catch (error) {
      logger.error(`Failed to handle sync failure: ${(error as Error).message}`);
    }
  }

  /**
   * Get sync status for a user
   * @param userId - User ID
   * @returns Promise<{ pending: number; syncing: number; completed: number; failed: number }>
   */
  static async getSyncStatus(userId: string): Promise<{
    pending: number;
    syncing: number;
    completed: number;
    failed: number;
  }> {
    try {
      const pendingItems = await this.getPendingOfflineItems(userId);
      const syncingItems = await this.getSyncingOfflineItems(userId);
      const completedItems = await this.getCompletedOfflineItems(userId);
      const failedItems = await this.getFailedOfflineItems(userId);

      return {
        pending: pendingItems.length,
        syncing: syncingItems.length,
        completed: completedItems.length,
        failed: failedItems.length
      };
    } catch (error) {
      logger.error(`Failed to get sync status: ${(error as Error).message}`);
      return { pending: 0, syncing: 0, completed: 0, failed: 0 };
    }
  }

  // Storage methods (simplified for now - in production use Redis or database)
  private static async storeOfflineItem(item: OfflineDataItem): Promise<void> {
    // In production, store in Redis or database collection
    // For now, just log
    logger.info(`Storing offline item: ${item.id}`);
  }

  private static async getPendingOfflineItems(userId: string): Promise<OfflineDataItem[]> {
    // In production, query from Redis or database
    // For now, return empty array
    return [];
  }

  private static async getSyncingOfflineItems(userId: string): Promise<OfflineDataItem[]> {
    return [];
  }

  private static async getCompletedOfflineItems(userId: string): Promise<OfflineDataItem[]> {
    return [];
  }

  private static async getFailedOfflineItems(userId: string): Promise<OfflineDataItem[]> {
    return [];
  }

  private static async updateSyncStatus(itemId: string, status: OfflineDataItem['syncStatus']): Promise<void> {
    logger.info(`Updating sync status for item ${itemId} to ${status}`);
  }

  private static async updateRetryCount(itemId: string, retryCount: number): Promise<void> {
    logger.info(`Updating retry count for item ${itemId} to ${retryCount}`);
  }
}

