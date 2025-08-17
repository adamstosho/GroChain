import { Request, Response } from 'express';
import { Notification } from '../models/notification.model';
import { sendNotification } from '../services/notification.service';
import { logger } from '../utils/logger';

export class NotificationController {
  /**
   * Send a notification to a user
   * POST /api/notifications/send
   */
  async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, type, title, message, data, priority, channel } = req.body || {};

      // Validate required fields
      const requiredFields = ['userId', 'type', 'title', 'message'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        res.status(400).json({
          status: 'error',
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
        return;
      }

      // Send notification
      const result = await sendNotification(
        userId,
        type,
        message,
        title,
        data
      );

      if (result.success) {
        res.status(200).json({
          status: 'success',
          message: 'Notification sent successfully',
          data: result
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: 'Failed to send notification',
          data: result
        });
      }
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error sending notification');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while sending notification'
      });
    }
  }

  /**
   * Get notifications for a user
   * GET /api/notifications
   */
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { userId, limit = 20, offset = 0, type, read } = req.query;

      if (!userId) {
        res.status(400).json({
          status: 'error',
          message: 'User ID is required'
        });
        return;
      }

      // Build query
      const query: any = { userId: userId as string };
      if (type) query.type = type;
      if (read !== undefined) query.read = read === 'true';

      // Get notifications with pagination
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(offset))
        .exec();

      res.status(200).json({
        status: 'success',
        message: 'Notifications retrieved successfully',
        data: notifications
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error retrieving notifications');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while retrieving notifications'
      });
    }
  }

  /**
   * Mark a notification as read
   * PUT /api/notifications/:id/read
   */
  async markNotificationAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          status: 'error',
          message: 'Notification ID is required'
        });
        return;
      }

      const notification = await Notification.findById(id).exec();
      
      if (!notification) {
        res.status(404).json({
          status: 'error',
          message: 'Notification not found'
        });
        return;
      }

      notification.read = true;
      await notification.save();

      res.status(200).json({
        status: 'success',
        message: 'Notification marked as read successfully',
        data: { id, read: true }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error updating notification');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while updating notification'
      });
    }
  }

  /**
   * Delete a notification
   * DELETE /api/notifications/:id
   */
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          status: 'error',
          message: 'Notification ID is required'
        });
        return;
      }

      const notification = await Notification.findById(id).exec();
      
      if (!notification) {
        res.status(404).json({
          status: 'error',
          message: 'Notification not found'
        });
        return;
      }

      await notification.deleteOne();

      res.status(200).json({
        status: 'success',
        message: 'Notification deleted successfully',
        data: { id }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error deleting notification');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while deleting notification'
      });
    }
  }

  /**
   * Mark all notifications as read for a user
   * PUT /api/notifications/read-all
   */
  async markAllNotificationsAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({
          status: 'error',
          message: 'User ID is required'
        });
        return;
      }

      const result = await Notification.updateMany(
        { userId, read: false },
        { read: true }
      ).exec();

      res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read',
        data: { updatedCount: result.modifiedCount }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error marking all notifications as read');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while updating notifications'
      });
    }
  }

  /**
   * Get notification statistics for a user
   * GET /api/notifications/stats/:userId
   */
  async getNotificationStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          status: 'error',
          message: 'User ID is required'
        });
        return;
      }

      const stats = await Notification.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } },
            read: { $sum: { $cond: [{ $eq: ['$read', true] }, 1, 0] } }
          }
        }
      ]);

      const result = stats[0] || { total: 0, unread: 0, read: 0 };

      res.status(200).json({
        status: 'success',
        message: 'Notification statistics retrieved successfully',
        data: result
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error retrieving notification statistics');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while retrieving notification statistics'
      });
    }
  }
}

export const notificationController = new NotificationController();
