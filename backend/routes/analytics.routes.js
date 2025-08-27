const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/analytics.controller')
const { authenticate } = require('../middlewares/auth.middleware')

// Public routes
router.get('/dashboard', ctrl.getDashboardMetrics)
router.get('/harvests', ctrl.getHarvestAnalytics)
router.get('/marketplace', ctrl.getMarketplaceAnalytics)
router.get('/financial', ctrl.getFinancialAnalytics)

// Protected routes (require authentication)
router.use(authenticate)

router.get('/farmers/:farmerId', ctrl.getFarmerAnalytics)
router.get('/partners/:partnerId', ctrl.getPartnerAnalytics)
router.get('/buyers/:buyerId', ctrl.getBuyerAnalytics)
router.post('/report', ctrl.generateReport)

module.exports = router

