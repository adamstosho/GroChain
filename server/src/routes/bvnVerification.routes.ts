import { Router } from 'express';
import bvnVerificationController from '../controllers/bvnVerification.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/verification/bvn
 * @desc    Verify BVN for user identity
 * @access  Private (All authenticated users)
 */
router.post(
  '/bvn',
  authenticate,
  bvnVerificationController.verifyBVN
);

/**
 * @route   GET /api/verification/status/:userId
 * @desc    Get verification status for a user
 * @access  Private (User can check own status, Admin can check any)
 */
router.get(
  '/status/:userId',
  authenticate,
  bvnVerificationController.getVerificationStatus
);

/**
 * @route   POST /api/verification/bvn/offline
 * @desc    Verify BVN offline (for testing/fallback)
 * @access  Private (Admin only)
 */
router.post(
  '/bvn/offline',
  authenticate,
  authorize(['admin']),
  bvnVerificationController.verifyBVNOffline
);

/**
 * @route   POST /api/verification/bvn/resend
 * @desc    Resend verification request
 * @access  Private (All authenticated users)
 */
router.post(
  '/bvn/resend',
  authenticate,
  bvnVerificationController.resendVerification
);

export default router;

