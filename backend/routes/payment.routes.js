const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/payment.controller')
const { authenticate } = require('../middlewares/auth.middleware')

// Public routes
router.get('/', ctrl.getPaymentConfig) // Root endpoint redirects to config
router.get('/config', ctrl.getPaymentConfig)
router.post('/initialize', ctrl.initializePayment)
router.get('/verify/:reference', ctrl.verifyPayment)

// Protected routes (require authentication)
router.use(authenticate)

router.post('/refund/:orderId', ctrl.processRefund)
router.get('/transactions', ctrl.getTransactionHistory)

module.exports = router

