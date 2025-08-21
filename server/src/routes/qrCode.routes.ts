import { Router } from 'express';
import qrCodeController from '../controllers/qrCode.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/qr-codes
 * @desc    Get user's QR codes
 * @access  Private (Authenticated users)
 */
router.get('/', authenticate, qrCodeController.getUserQRCodes);

/**
 * @route   POST /api/qr-codes
 * @desc    Generate new QR code for existing harvest
 * @access  Private (Authenticated users)
 */
router.post('/', authenticate, qrCodeController.generateNewQRCode);

/**
 * @route   GET /api/qr-codes/stats
 * @desc    Get QR code statistics
 * @access  Private (Authenticated users)
 */
router.get('/stats', authenticate, qrCodeController.getQRCodeStats);

export default router;
