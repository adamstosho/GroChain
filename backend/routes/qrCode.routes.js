const router = require('express').Router()
const { authenticate } = require('../middlewares/auth.middleware')
const qrCodeController = require('../controllers/qrCode.controller')

/**
 * @route   GET /api/qr-codes
 * @desc    Get user's QR codes
 * @access  Private (Authenticated users)
 */
router.get('/', authenticate, qrCodeController.getUserQRCodes)

/**
 * @route   POST /api/qr-codes
 * @desc    Generate new QR code for existing harvest
 * @access  Private (Authenticated users)
 */
router.post('/', authenticate, qrCodeController.generateNewQRCode)

/**
 * @route   GET /api/qr-codes/stats
 * @desc    Get QR code statistics
 * @access  Private (Authenticated users)
 */
router.get('/stats', authenticate, qrCodeController.getQRCodeStats)

/**
 * @route   GET /api/qr-codes/:id
 * @desc    Get specific QR code details
 * @access  Private (Authenticated users)
 */
router.get('/:id', authenticate, qrCodeController.getQRCodeById)

/**
 * @route   DELETE /api/qr-codes/:id
 * @desc    Delete QR code
 * @access  Private (Authenticated users)
 */
router.delete('/:id', authenticate, qrCodeController.deleteQRCode)

module.exports = router

