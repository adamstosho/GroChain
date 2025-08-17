import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bvnVerificationService from '../../src/services/bvnVerification.service';
import BVNVerification from '../../src/models/bvnVerification.model';

describe('BVN Verification Service', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await BVNVerification.deleteMany({});
  });

  describe('verifyBVN', () => {
    const mockRequest = {
      bvn: '12345678901',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      phoneNumber: '+2348012345678'
    };

    it('should validate BVN format correctly', async () => {
      const result = await bvnVerificationService.verifyBVN(mockRequest);
      
      expect(result).toBeDefined();
      expect(result.verificationId).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.verificationMethod).toBeDefined();
    });

    it('should reject invalid BVN format', async () => {
      const invalidRequest = { ...mockRequest, bvn: '12345' };
      const result = await bvnVerificationService.verifyBVN(invalidRequest);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Invalid BVN format');
      expect(result.verificationMethod).toBe('offline');
    });

    it('should reject empty BVN', async () => {
      const invalidRequest = { ...mockRequest, bvn: '' };
      const result = await bvnVerificationService.verifyBVN(invalidRequest);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Invalid BVN format');
    });

    it('should handle missing required fields gracefully', async () => {
      const incompleteRequest = {
        bvn: '12345678901',
        firstName: '',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+2348012345678'
      };
      
      const result = await bvnVerificationService.verifyBVN(incompleteRequest);
      expect(result).toBeDefined();
      expect(result.verificationId).toBeDefined();
    });
  });

  describe('generateVerificationId', () => {
    it('should generate unique verification IDs', async () => {
      const id1 = bvnVerificationService['generateVerificationId']();
      const id2 = bvnVerificationService['generateVerificationId']();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^bvn_\d+_[a-z0-9]+$/);
    });
  });

  describe('validateBVNFormat', () => {
    it('should validate correct BVN format', () => {
      const isValid = bvnVerificationService['validateBVNFormat']('12345678901');
      expect(isValid).toBe(true);
    });

    it('should reject BVN with wrong length', () => {
      expect(bvnVerificationService['validateBVNFormat']('1234567890')).toBe(false);
      expect(bvnVerificationService['validateBVNFormat']('123456789012')).toBe(false);
    });

    it('should reject non-numeric BVN', () => {
      expect(bvnVerificationService['validateBVNFormat']('1234567890a')).toBe(false);
      expect(bvnVerificationService['validateBVNFormat']('1234567890 ')).toBe(false);
    });

    it('should reject empty or null BVN', () => {
      expect(bvnVerificationService['validateBVNFormat']('')).toBe(false);
      expect(bvnVerificationService['validateBVNFormat'](null as any)).toBe(false);
      expect(bvnVerificationService['validateBVNFormat'](undefined as any)).toBe(false);
    });
  });

  describe('processManualVerification', () => {
    it('should process manual verification request', async () => {
      const mockRequest = {
        bvn: '12345678901',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+2348012345678'
      };

      const result = await bvnVerificationService['processManualVerification'](mockRequest);
      
      expect(result).toBeDefined();
      expect(result.isValid).toBe(true);
      expect(result.message).toContain('manual verification');
      expect(result.verificationMethod).toBe('manual');
    });
  });

  describe('getVerificationStatus', () => {
    it('should return verification status for valid ID', async () => {
      const mockVerification = new BVNVerification({
        verificationId: 'test_id',
        bvn: '12345678901',
        verificationStatus: 'pending',
        submittedAt: new Date()
      });
      await mockVerification.save();

      const status = await bvnVerificationService.getVerificationStatus('test_id');
      expect(status).toBeDefined();
    });

    it('should return null for invalid verification ID', async () => {
      const status = await bvnVerificationService.getVerificationStatus('invalid_id');
      expect(status).toBeNull();
    });
  });

  describe('updateVerificationStatus', () => {
    it('should update verification status successfully', async () => {
      const mockVerification = new BVNVerification({
        verificationId: 'test_id',
        bvn: '12345678901',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+2348012345678',
        verificationStatus: 'pending',
        submittedAt: new Date(),
        user: new mongoose.Types.ObjectId()
      });
      await mockVerification.save();

      const result = await bvnVerificationService.updateVerificationStatus(
        'test_id',
        'verified',
        'Test approval',
        new mongoose.Types.ObjectId().toString()
      );

      expect(result).toBe(true);

      const updated = await BVNVerification.findOne({ verificationId: 'test_id' });
      expect(updated?.verificationStatus).toBe('verified');
              expect(updated?.adminNotes).toBe('Test approval');
        expect(updated?.reviewedBy).toBeDefined();
    });

    it('should return false for non-existent verification', async () => {
      const result = await bvnVerificationService.updateVerificationStatus(
        'non_existent',
        'approved'
      );
      expect(result).toBe(false);
    });
  });

  describe('getPendingVerifications', () => {
    it('should return pending verifications with pagination', async () => {
      // Create multiple pending verifications
      const verifications = [
        { verificationId: 'test1', bvn: '12345678901', firstName: 'John', lastName: 'Doe', dateOfBirth: new Date('1990-01-01'), phoneNumber: '+2348012345678', verificationStatus: 'pending', submittedAt: new Date(), user: new mongoose.Types.ObjectId() },
        { verificationId: 'test2', bvn: '12345678902', firstName: 'Jane', lastName: 'Smith', dateOfBirth: new Date('1985-01-01'), phoneNumber: '+2348023456789', verificationStatus: 'pending', submittedAt: new Date(), user: new mongoose.Types.ObjectId() },
        { verificationId: 'test3', bvn: '12345678903', firstName: 'Bob', lastName: 'Johnson', dateOfBirth: new Date('1988-01-01'), phoneNumber: '+2348034567890', verificationStatus: 'pending', submittedAt: new Date(), user: new mongoose.Types.ObjectId() }
      ];

      for (const verification of verifications) {
        await new BVNVerification(verification).save();
      }

      const result = await bvnVerificationService.getPendingVerifications(2, 0);
      expect(result).toHaveLength(2);
      expect(result[0].verificationId).toBe('test1');
      expect(result[1].verificationId).toBe('test2');
    });

    it('should return empty array when no pending verifications', async () => {
      const result = await bvnVerificationService.getPendingVerifications();
      expect(result).toHaveLength(0);
    });
  });

  describe('getVerificationStats', () => {
    it('should return correct verification statistics', async () => {
      // Create verifications with different statuses
      const verifications = [
        { verificationId: 'test1', bvn: '12345678901', firstName: 'John', lastName: 'Doe', dateOfBirth: new Date('1990-01-01'), phoneNumber: '+2348012345678', verificationStatus: 'pending', submittedAt: new Date(), user: new mongoose.Types.ObjectId() },
        { verificationId: 'test2', bvn: '12345678902', firstName: 'Jane', lastName: 'Smith', dateOfBirth: new Date('1985-01-01'), phoneNumber: '+2348023456789', verificationStatus: 'verified', submittedAt: new Date(), user: new mongoose.Types.ObjectId() },
        { verificationId: 'test3', bvn: '12345678903', firstName: 'Bob', lastName: 'Johnson', dateOfBirth: new Date('1988-01-01'), phoneNumber: '+2348034567890', verificationStatus: 'failed', submittedAt: new Date(), user: new mongoose.Types.ObjectId() },
        { verificationId: 'test4', bvn: '12345678904', firstName: 'Alice', lastName: 'Brown', dateOfBirth: new Date('1992-01-01'), phoneNumber: '+2348045678901', verificationStatus: 'pending', submittedAt: new Date(), user: new mongoose.Types.ObjectId() }
      ];

      for (const verification of verifications) {
        await new BVNVerification(verification).save();
      }

      const stats = await bvnVerificationService.getVerificationStats();
      
      expect(stats.total).toBe(4);
      expect(stats.pending).toBe(2);
      expect(stats.verified).toBe(1);
      expect(stats.failed).toBe(1);
    });

    it('should return zero stats when no verifications exist', async () => {
      const stats = await bvnVerificationService.getVerificationStats();
      
      expect(stats.total).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.approved).toBe(0);
      expect(stats.rejected).toBe(0);
    });
  });
});
