import { Router } from 'express';
import { 
  sendNotification, 
  sendBulkNotifications, 
  getUserNotificationPreferences, 
  updateUserNotificationPreferences,
  sendTransactionNotification,
  sendHarvestNotification,
  sendMarketplaceNotification
} from '../services/notification.service';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';

const router = Router();

// Send notification to a specific user
router.post('/send', authenticateJWT, authorizeRoles('admin', 'partner'), async (req, res) => {
  try {
    const { userId, type, message, title, data, category } = req.body;
    
    if (!userId || !type || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'userId, type, and message are required'
      });
    }

    const result = await sendNotification(userId, type, message, title, data, category);
    
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
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send bulk notifications
router.post('/send-bulk', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const { userIds, type, message, title, data, category } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || !type || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'userIds array, type, and message are required'
      });
    }

    const results = await sendBulkNotifications(userIds, type, message, title, data, category);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    res.status(200).json({
      status: 'success',
      message: `Bulk notifications sent. ${successful} successful, ${failed} failed.`,
      summary: { total: results.length, successful, failed },
      results
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user notification preferences
router.get('/preferences', authenticateJWT, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const preferences = await getUserNotificationPreferences(userId);
    
    res.status(200).json({
      status: 'success',
      data: preferences
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get notification preferences',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update user notification preferences
router.put('/preferences', authenticateJWT, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const preferences = req.body;
    
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        status: 'error',
        message: 'Preferences object is required'
      });
    }

    const result = await updateUserNotificationPreferences(userId, preferences);
    
    if (result.success) {
      res.status(200).json({
        status: 'success',
        message: 'Notification preferences updated successfully',
        data: result.preferences
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to update notification preferences',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update push token
router.put('/push-token', authenticateJWT, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { pushToken } = req.body;
    
    if (!pushToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Push token is required'
      });
    }

    const User = require('../models/user.model').User;
    await User.findByIdAndUpdate(userId, { pushToken });
    
    res.status(200).json({
      status: 'success',
      message: 'Push token updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update push token',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send transaction notification
router.post('/transaction', authenticateJWT, async (req, res) => {
  try {
    const { userId, transactionType, amount, currency, reference } = req.body;
    
    if (!userId || !transactionType || !amount) {
      return res.status(400).json({
        status: 'error',
        message: 'userId, transactionType, and amount are required'
      });
    }

    const result = await sendTransactionNotification(userId, transactionType, amount, currency, reference);
    
    if (result.success) {
      res.status(200).json({
        status: 'success',
        message: 'Transaction notification sent successfully',
        data: result
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to send transaction notification',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send harvest notification
router.post('/harvest', authenticateJWT, async (req, res) => {
  try {
    const { userId, cropType, quantity, batchId } = req.body;
    
    if (!userId || !cropType || !quantity || !batchId) {
      return res.status(400).json({
        status: 'error',
        message: 'userId, cropType, quantity, and batchId are required'
      });
    }

    const result = await sendHarvestNotification(userId, cropType, quantity, batchId);
    
    if (result.success) {
      res.status(200).json({
        status: 'success',
        message: 'Harvest notification sent successfully',
        data: result
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to send harvest notification',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send marketplace notification
router.post('/marketplace', authenticateJWT, async (req, res) => {
  try {
    const { userId, action, details } = req.body;
    
    if (!userId || !action || !details) {
      return res.status(400).json({
        status: 'error',
        message: 'userId, action, and details are required'
      });
    }

    const result = await sendMarketplaceNotification(userId, action, details);
    
    if (result.success) {
      res.status(200).json({
        status: 'success',
        message: 'Marketplace notification sent successfully',
        data: result
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to send marketplace notification',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
