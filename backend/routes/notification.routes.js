const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/notification.controller')
const { authenticate } = require('../middlewares/auth.middleware')

// All notification routes require authentication
router.use(authenticate)

// Root endpoint - get all notifications for user
router.get('/', ctrl.getUserNotifications)

// Notification management
router.post('/send', ctrl.sendNotification)
router.post('/send-bulk', ctrl.sendBulkNotifications)
router.get('/user', ctrl.getUserNotifications)
router.patch('/:notificationId/read', ctrl.markAsRead)
router.patch('/mark-all-read', ctrl.markAllAsRead)

// Notification preferences
router.get('/preferences', ctrl.getNotificationPreferences)
router.put('/preferences', ctrl.updateNotificationPreferences)
router.put('/push-token', ctrl.updatePushToken)

// Specialized notifications
router.post('/harvest', ctrl.sendHarvestNotification)
router.post('/marketplace', ctrl.sendMarketplaceNotification)
router.post('/transaction', ctrl.sendTransactionNotification)

module.exports = router

