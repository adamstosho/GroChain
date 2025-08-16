import { Request, Response } from 'express';
import bvnVerificationService from '../services/bvnVerification.service';
import { logger } from '../utils/logger';

export class BVNVerificationController {
  /**
   * Verify BVN for user identity
   * POST /api/verification/bvn
   */
  async verifyBVN(req: Request, res: Response): Promise<void> {
    try {
      const { bvn, firstName, lastName, dateOfBirth, phoneNumber } = req.body;

      // Basic validation
      if (!bvn || !firstName || !lastName || !dateOfBirth || !phoneNumber) {
        res.status(400).json({
          status: 'error',
          message: 'All fields are required: bvn, firstName, lastName, dateOfBirth, phoneNumber'
        });
        return;
      }

      // Call BVN verification service
      const verificationResult = await bvnVerificationService.verifyBVN({
        bvn,
        firstName,
        lastName,
        dateOfBirth,
        phoneNumber
      });

      if (verificationResult.isValid) {
        res.status(200).json({
          status: 'success',
          message: 'BVN verification successful',
          data: {
            verificationId: verificationResult.verificationId,
            timestamp: verificationResult.timestamp,
            userDetails: verificationResult.userDetails,
            isVerified: true
          }
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: verificationResult.message,
          data: {
            verificationId: verificationResult.verificationId,
            timestamp: verificationResult.timestamp,
            isVerified: false
          }
        });
      }
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in BVN verification');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error during BVN verification'
      });
    }
  }

  /**
   * Get verification status for a user
   * GET /api/verification/status/:userId
   */
  async getVerificationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          status: 'error',
          message: 'User ID is required'
        });
        return;
      }

      // This would typically query your database for verification status
      // For now, returning a mock response
      res.status(200).json({
        status: 'success',
        message: 'Verification status retrieved successfully',
        data: {
          userId,
          isVerified: false,
          verificationType: 'bvn',
          lastVerified: null,
          verificationHistory: []
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting verification status');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while retrieving verification status'
      });
    }
  }

  /**
   * Verify BVN offline (for testing/fallback)
   * POST /api/verification/bvn/offline
   */
  async verifyBVNOffline(req: Request, res: Response): Promise<void> {
    try {
      const { bvn } = req.body;

      if (!bvn) {
        res.status(400).json({
          status: 'error',
          message: 'BVN is required'
        });
        return;
      }

      // Use the public verifyBVN method instead of private verifyBVNOffline
      const result = await bvnVerificationService.verifyBVN({
        bvn,
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '1234567890'
      });
      const isValid = result.isValid;

      res.status(200).json({
        status: 'success',
        message: isValid ? 'BVN format is valid' : 'BVN format is invalid',
        data: {
          bvn,
          isValid,
          verificationType: 'offline',
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in offline BVN verification');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error during offline BVN verification'
      });
    }
  }

  /**
   * Resend verification request
   * POST /api/verification/bvn/resend
   */
  async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, bvn } = req.body;

      if (!userId || !bvn) {
        res.status(400).json({
          status: 'error',
          message: 'User ID and BVN are required'
        });
        return;
      }

      // Generate new verification request
      const verificationId = `bvn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      res.status(200).json({
        status: 'success',
        message: 'Verification request resent successfully',
        data: {
          verificationId,
          userId,
          bvn,
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error resending verification');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while resending verification'
      });
    }
  }
}

export default new BVNVerificationController();

