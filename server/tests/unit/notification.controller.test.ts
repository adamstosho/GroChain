import { Request, Response } from 'express';
import { notificationController } from '../../src/controllers/notification.controller';

// Mock the models
jest.mock('../../src/models/notification.model');
jest.mock('../../src/services/notification.service');

const mockNotification = require('../../src/models/notification.model').Notification;
const mockSendNotification = require('../../src/services/notification.service').sendNotification;

describe('Notification Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {
      body: {},
      params: {},
      query: {}
    };
    
    mockResponse = {
      json: mockJson,
      status: mockStatus
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('sendNotification', () => {
    it('should send notification successfully', async () => {
      const notificationData = {
        userId: 'test-user-id',
        type: 'harvest_reminder',
        title: 'Harvest Reminder',
        message: 'Time to harvest your crops',
        data: { cropType: 'maize' }
      };

      mockRequest.body = notificationData;
      mockSendNotification.mockResolvedValue({
        success: true,
        notificationId: 'test-notification-id'
      });

      await notificationController.sendNotification(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockSendNotification).toHaveBeenCalledWith(
        'test-user-id',
        'harvest_reminder',
        'Time to harvest your crops',
        'Harvest Reminder',
        { cropType: 'maize' }
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Notification sent successfully',
        data: {
          success: true,
          notificationId: 'test-notification-id'
        }
      });
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        userId: 'test-user-id',
        // Missing type, title, message
        data: { cropType: 'maize' }
      };

      mockRequest.body = incompleteData;

      await notificationController.sendNotification(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Missing required fields: type, title, message'
      });
    });

    it('should handle notification service errors', async () => {
      const notificationData = {
        userId: 'test-user-id',
        type: 'harvest_reminder',
        title: 'Harvest Reminder',
        message: 'Time to harvest your crops'
      };

      mockRequest.body = notificationData;
      mockSendNotification.mockRejectedValue(new Error('Service unavailable'));

      await notificationController.sendNotification(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error while sending notification'
      });
    });

    it('should handle empty body', async () => {
      mockRequest.body = {};

      await notificationController.sendNotification(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Missing required fields: userId, type, title, message'
      });
    });

    it('should handle null body', async () => {
      mockRequest.body = null;

      await notificationController.sendNotification(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Missing required fields: userId, type, title, message'
      });
    });

    it('should handle partial missing fields', async () => {
      const partialData = {
        userId: 'test-user-id',
        type: 'harvest_reminder',
        // Missing title and message
        data: { cropType: 'maize' }
      };

      mockRequest.body = partialData;

      await notificationController.sendNotification(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Missing required fields: title, message'
      });
    });

    it('should handle successful notification with additional data', async () => {
      const notificationData = {
        userId: 'test-user-id',
        type: 'marketplace_update',
        title: 'New Order',
        message: 'You have a new order',
        data: {
          orderId: 'order-123',
          amount: 5000,
          customerName: 'John Doe'
        },
        priority: 'high',
        channel: 'push'
      };

      mockRequest.body = notificationData;
      mockSendNotification.mockResolvedValue({
        success: true,
        notificationId: 'test-notification-id',
        sentAt: new Date().toISOString()
      });

      await notificationController.sendNotification(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockSendNotification).toHaveBeenCalledWith(notificationData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Notification sent successfully',
        data: {
          success: true,
          notificationId: 'test-notification-id',
          sentAt: expect.any(String)
        }
      });
    });

    it('should handle notification service returning failure', async () => {
      const notificationData = {
        userId: 'test-user-id',
        type: 'harvest_reminder',
        title: 'Harvest Reminder',
        message: 'Time to harvest your crops'
      };

      mockRequest.body = notificationData;
      mockSendNotification.mockResolvedValue({
        success: false,
        error: 'User not found'
      });

      await notificationController.sendNotification(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockSendNotification).toHaveBeenCalledWith(notificationData);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to send notification',
        data: {
          success: false,
          error: 'User not found'
        }
      });
    });
  });

  describe('getNotifications', () => {
    it('should get notifications for user successfully', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'harvest_reminder',
          title: 'Harvest Reminder',
          message: 'Time to harvest your crops',
          createdAt: new Date().toISOString(),
          read: false
        },
        {
          id: 'notif-2',
          type: 'marketplace_update',
          title: 'New Order',
          message: 'You have a new order',
          createdAt: new Date().toISOString(),
          read: true
        }
      ];

      mockRequest.query = { userId: 'test-user-id', limit: '10' };

      // Mock successful notification retrieval
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockNotifications)
          })
        })
      });

      mockNotification.find = mockFind;

      await notificationController.getNotifications(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockFind).toHaveBeenCalledWith({ userId: 'test-user-id' });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Notifications retrieved successfully',
        data: mockNotifications
      });
    });

    it('should handle missing userId parameter', async () => {
      mockRequest.query = { limit: '10' };

      await notificationController.getNotifications(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'User ID is required'
      });
    });

    it('should handle database errors', async () => {
      mockRequest.query = { userId: 'test-user-id' };

      // Mock the Notification model to throw an error
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockRejectedValue(new Error('Database error'))
          })
        })
      });

      mockNotification.find = mockFind;

      await notificationController.getNotifications(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error while retrieving notifications'
      });
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const mockNotificationDoc = {
        id: 'notif-1',
        read: false,
        save: jest.fn().mockResolvedValue(true)
      };

      mockRequest.params = { id: 'notif-1' };

      mockNotification.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNotificationDoc)
      });

      await notificationController.markNotificationAsRead(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockNotificationDoc.read).toBe(true);
      expect(mockNotificationDoc.save).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Notification marked as read successfully',
        data: { id: 'notif-1', read: true }
      });
    });

    it('should handle notification not found', async () => {
      mockRequest.params = { id: 'non-existent-id' };

      mockNotification.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      await notificationController.markNotificationAsRead(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Notification not found'
      });
    });

    it('should handle missing notification ID', async () => {
      mockRequest.params = {};

      await notificationController.markNotificationAsRead(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Notification ID is required'
      });
    });

    it('should handle database errors', async () => {
      const mockNotificationDoc = {
        id: 'notif-1',
        read: false,
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      mockRequest.params = { id: 'notif-1' };

      mockNotification.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNotificationDoc)
      });

      await notificationController.markNotificationAsRead(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error while updating notification'
      });
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const mockNotificationDoc = {
        id: 'notif-1',
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
      };

      mockRequest.params = { id: 'notif-1' };

      mockNotification.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNotificationDoc)
      });

      await notificationController.deleteNotification(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockNotificationDoc.deleteOne).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Notification deleted successfully',
        data: { id: 'notif-1' }
      });
    });

    it('should handle notification not found for deletion', async () => {
      mockRequest.params = { id: 'non-existent-id' };

      mockNotification.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      await notificationController.deleteNotification(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Notification not found'
      });
    });

    it('should handle missing notification ID for deletion', async () => {
      mockRequest.params = {};

      await notificationController.deleteNotification(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Notification ID is required'
      });
    });

    it('should handle database errors during deletion', async () => {
      const mockNotificationDoc = {
        id: 'notif-1',
        deleteOne: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      mockRequest.params = { id: 'notif-1' };

      mockNotification.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNotificationDoc)
      });

      await notificationController.deleteNotification(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error while deleting notification'
      });
    });
  });
});
