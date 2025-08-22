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

// NEW ENDPOINT - General Verification Status
router.get(
  '/status',
  authenticate,
  (req, res) => {
    // TODO: Implement general verification status controller
    res.json({
      success: true,
      data: {
        verifications: [
          {
            id: "ver_001",
            bvn: "12345678901",
            firstName: "John",
            lastName: "Doe",
            verificationStatus: "verified",
            verificationMethod: "online",
            submittedAt: "2025-01-15T10:30:00Z",
            verifiedAt: "2025-01-15T11:00:00Z"
          }
        ]
      }
    });
  }
);

export default router;

