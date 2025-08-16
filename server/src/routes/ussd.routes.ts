import { Router } from 'express';
import ussdController from '../controllers/ussd.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/ussd
 * @desc    Handle USSD requests from telecom providers
 * @access  Public (Telecom provider webhooks)
 */
router.post('/', ussdController.handleUSSDRequest);

/**
 * @route   POST /api/ussd/callback
 * @desc    Handle USSD callbacks from telecom providers
 * @access  Public (Telecom provider webhooks)
 */
router.post('/callback', ussdController.handleUSSDCallback);

/**
 * @route   GET /api/ussd/info
 * @desc    Get USSD service information
 * @access  Public
 */
router.get('/info', ussdController.getUSSDInfo);

/**
 * @route   POST /api/ussd/test
 * @desc    Test USSD service (for development)
 * @access  Private (Admin only)
 */
router.post('/test', authenticate, authorize(['admin']), ussdController.testUSSDService);

/**
 * @route   GET /api/ussd/stats
 * @desc    Get USSD usage statistics
 * @access  Private (Admin only)
 */
router.get('/stats', authenticate, authorize(['admin']), ussdController.getUSSDStats);

/**
 * @route   POST /api/ussd/register
 * @desc    Register USSD service with telecom provider
 * @access  Private (Admin only)
 */
router.post('/register', authenticate, authorize(['admin']), ussdController.registerUSSDService);

export default router;

