const express = require('express')
const router = express.Router()
const priceAlertController = require('../controllers/price-alert.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const { validateRequest } = require('../middlewares/validation.middleware')

// Validation schemas
const createPriceAlertSchema = {
  body: {
    listingId: { type: 'string', required: true },
    targetPrice: { type: 'number', required: true, min: 0 },
    alertType: { type: 'string', enum: ['price_drop', 'price_increase', 'both'], optional: true },
    notificationChannels: { type: 'array', items: { type: 'string', enum: ['email', 'sms', 'push', 'in_app'] }, optional: true }
  }
}

const updatePriceAlertSchema = {
  body: {
    targetPrice: { type: 'number', min: 0, optional: true },
    alertType: { type: 'string', enum: ['price_drop', 'price_increase', 'both'], optional: true },
    isActive: { type: 'boolean', optional: true },
    notificationChannels: { type: 'array', items: { type: 'string', enum: ['email', 'sms', 'push', 'in_app'] }, optional: true }
  }
}

// All routes require authentication
router.use(authenticate)

// Create a new price alert
router.post('/', 
  validateRequest(createPriceAlertSchema),
  priceAlertController.createPriceAlert
)

// Get user's price alerts
router.get('/', priceAlertController.getUserPriceAlerts)

// Get price alert statistics
router.get('/stats', priceAlertController.getPriceAlertStats)

// Get specific price alert
router.get('/:alertId', priceAlertController.getPriceAlert)

// Update price alert
router.put('/:alertId',
  validateRequest(updatePriceAlertSchema),
  priceAlertController.updatePriceAlert
)

// Delete price alert
router.delete('/:alertId', priceAlertController.deletePriceAlert)

// Admin route to check all price alerts (for scheduled jobs)
router.post('/check-all', priceAlertController.checkPriceAlerts)

module.exports = router

