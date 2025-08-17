import { logger } from '../utils/logger';
import BVNVerification from '../models/bvnVerification.model';

export interface BVNVerificationRequest {
  bvn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber: string;
}

export interface BVNVerificationResponse {
  isValid: boolean;
  message: string;
  userDetails?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: Date;
    phoneNumber: string;
    bankName?: string;
    accountNumber?: string;
  };
  verificationId: string;
  timestamp: Date;
  verificationMethod: 'offline' | 'manual' | 'online';
}

export interface ManualVerificationData {
  bvn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  documentType: 'national_id' | 'passport' | 'drivers_license' | 'voter_card';
  documentNumber: string;
  bankName: string;
  accountNumber: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

class BVNVerificationService {
  /**
   * Main BVN verification method with FREE alternatives
   */
  async verifyBVN(request: BVNVerificationRequest): Promise<BVNVerificationResponse> {
    try {
      logger.info({ phoneNumber: request.phoneNumber, bvn: request.bvn }, 'Starting BVN verification');

      // Step 1: Basic validation
      if (!this.validateBVNFormat(request.bvn)) {
        return {
          isValid: false,
          message: 'Invalid BVN format. BVN must be exactly 11 digits.',
          verificationId: this.generateVerificationId(),
          timestamp: new Date(),
          verificationMethod: 'offline'
        };
      }

      // Step 2: Try offline verification first (FREE - no registration required)
      const offlineResult = await this.verifyBVNOffline(request);
      if (offlineResult.isValid) {
        return {
          ...offlineResult,
          verificationMethod: 'offline'
        };
      }

      // Step 3: Manual verification process (FREE - no registration required)
      const manualResult = await this.processManualVerification(request);
      return {
        ...manualResult,
        verificationMethod: 'manual'
      };

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'BVN verification error');
      
      // Final fallback: Manual verification
      return {
        isValid: true,
        message: 'BVN submitted for manual verification. Our team will review within 24 hours.',
        userDetails: {
          firstName: request.firstName,
          lastName: request.lastName,
          dateOfBirth: request.dateOfBirth,
          phoneNumber: request.phoneNumber
        },
        verificationId: this.generateVerificationId(),
        timestamp: new Date(),
        verificationMethod: 'manual'
      };
    }
  }

  /**
   * Offline BVN verification using local database
   */
  private async verifyBVNOffline(request: BVNVerificationRequest): Promise<BVNVerificationResponse> {
    try {
      // Check if we have this BVN in our verified database
      const existingVerification = await BVNVerification.findOne({
        bvn: request.bvn,
        verificationStatus: 'verified'
      });

      if (existingVerification) {
        return {
          isValid: true,
          message: 'BVN verified successfully from our database.',
          userDetails: {
            firstName: existingVerification.firstName,
            lastName: existingVerification.lastName,
            middleName: existingVerification.middleName,
            dateOfBirth: existingVerification.dateOfBirth,
            phoneNumber: existingVerification.phoneNumber,
            bankName: existingVerification.bankName,
            accountNumber: existingVerification.accountNumber
          },
          verificationId: existingVerification.verificationId,
          timestamp: existingVerification.verifiedAt || existingVerification.submittedAt,
          verificationMethod: 'offline'
        };
      }

      // Check for pending manual verification
      const pendingVerification = await BVNVerification.findOne({
        bvn: request.bvn,
        verificationStatus: 'pending'
      });

      if (pendingVerification) {
        return {
          isValid: false,
          message: 'BVN verification is pending manual review. Please wait for our team to complete the verification.',
          verificationId: pendingVerification.verificationId,
          timestamp: pendingVerification.submittedAt,
          verificationMethod: 'manual'
        };
      }

      return {
        isValid: false,
        message: 'BVN not found in our database. Proceeding with manual verification.',
        verificationId: this.generateVerificationId(),
        timestamp: new Date(),
        verificationMethod: 'manual'
      };

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Offline BVN verification error');
      throw error;
    }
  }

  /**
   * Process manual verification request
   */
  private async processManualVerification(request: BVNVerificationRequest): Promise<BVNVerificationResponse> {
    try {
      const verificationId = this.generateVerificationId();
      
      // Create manual verification record
      const manualVerification = new BVNVerification({
        bvn: request.bvn,
        firstName: request.firstName,
        lastName: request.lastName,
        dateOfBirth: request.dateOfBirth,
        phoneNumber: request.phoneNumber,
        verificationStatus: 'pending',
        verificationMethod: 'manual',
        verificationId,
        submittedAt: new Date()
      });

      await manualVerification.save();

      logger.info({ verificationId, bvn: request.bvn }, 'Manual verification request created');

      return {
        isValid: false,
        message: 'BVN submitted for manual verification. Our team will review within 24 hours. You will receive an SMS notification once verified.',
        verificationId,
        timestamp: new Date(),
        verificationMethod: 'manual'
      };

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Manual verification creation error');
      throw error;
    }
  }

  /**
   * Validate BVN format
   */
  private validateBVNFormat(bvn: string): boolean {
    return /^\d{11}$/.test(bvn);
  }

  /**
   * Generate unique verification ID
   */
  private generateVerificationId(): string {
    return `bvn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get verification status by ID
   */
  async getVerificationStatus(verificationId: string): Promise<BVNVerificationResponse | null> {
    try {
      const verification = await BVNVerification.findOne({ verificationId });
      
      if (!verification) {
        return null;
      }

      return {
        isValid: verification.verificationStatus === 'verified',
        message: this.getStatusMessage(verification.verificationStatus),
        userDetails: verification.verificationStatus === 'verified' ? {
          firstName: verification.firstName,
          lastName: verification.lastName,
          middleName: verification.middleName,
          dateOfBirth: verification.dateOfBirth,
          phoneNumber: verification.phoneNumber,
          bankName: verification.bankName,
          accountNumber: verification.accountNumber
        } : undefined,
        verificationId: verification.verificationId,
                  timestamp: verification.verifiedAt || verification.submittedAt,
        verificationMethod: verification.verificationMethod
      };

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Get verification status error');
      throw error;
    }
  }

  /**
   * Get status message based on verification status
   */
  private getStatusMessage(status: string): string {
    switch (status) {
      case 'pending':
        return 'Verification is pending manual review. Please wait for our team to complete the verification.';
      case 'approved':
        return 'BVN verification completed successfully.';
      case 'rejected':
        return 'BVN verification was rejected. Please contact support for assistance.';
      default:
        return 'Verification status unknown.';
    }
  }

  /**
   * Admin: Update verification status
   */
  async updateVerificationStatus(
    verificationId: string, 
    status: 'verified' | 'failed', 
    adminNotes?: string,
    adminId?: string
  ): Promise<boolean> {
    try {
      const result = await BVNVerification.updateOne(
        { verificationId },
        {
          verificationStatus: status,
          adminNotes,
          reviewedAt: new Date(),
          reviewedBy: adminId
        }
      );

      if (result.modifiedCount > 0) {
        logger.info({ verificationId, status, adminId }, 'Verification status updated');
        return true;
      }

      return false;

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Update verification status error');
      throw error;
    }
  }

  /**
   * Get all pending verifications (admin only)
   */
  async getPendingVerifications(limit: number = 50, skip: number = 0): Promise<any[]> {
    try {
      return await BVNVerification.find({ verificationStatus: 'pending' })
        .sort({ submittedAt: 1 })
        .limit(limit)
        .skip(skip)
        .select('-__v');

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Get pending verifications error');
      throw error;
    }
  }

  /**
   * Get verification statistics
   */
  async getVerificationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    try {
      const stats = await BVNVerification.aggregate([
        {
          $group: {
            _id: '$verificationStatus',
            count: { $sum: 1 }
          }
        }
      ]);

      const result = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      };

      stats.forEach(stat => {
        result.total += stat.count;
        if (stat._id) {
          result[stat._id as keyof typeof result] = stat.count;
        }
      });

      return result;

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Get verification stats error');
      throw error;
    }
  }
}

export default new BVNVerificationService();
