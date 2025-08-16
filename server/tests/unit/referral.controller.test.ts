import { Request, Response } from 'express';
import { referralController } from '../../src/controllers/referral.controller';

// Mock the models
jest.mock('../../src/models/referral.model');
jest.mock('../../src/models/user.model');

const mockReferral = require('../../src/models/referral.model').Referral;
const mockUser = require('../../src/models/user.model').User;

describe('Referral Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {
      body: {},
      params: {},
      query: {}
    };
    
    mockResponse = {
      json: mockJson,
      status: mockStatus
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('createReferral', () => {
    it('should create referral successfully', async () => {
      const referralData = {
        referrerId: 'test-referrer-id',
        referredUserId: 'test-referred-user-id',
        referralType: 'farmer',
        notes: 'Test referral'
      };

      mockRequest.body = referralData;

      // Mock successful referral creation
      const mockCreatedReferral = {
        _id: 'test-referral-id',
        ...referralData,
        status: 'pending',
        createdAt: new Date()
      };

      mockReferral.create.mockResolvedValue(mockCreatedReferral);

      await referralController.createReferral(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockReferral.create).toHaveBeenCalledWith({
        referrerId: 'test-referrer-id',
        referredUserId: 'test-referred-user-id',
        referralType: 'farmer',
        notes: 'Test referral',
        status: 'pending',
        createdAt: expect.any(Date)
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Referral created successfully',
        data: mockCreatedReferral
      });
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        referrerId: 'test-referrer-id',
        // Missing referredUserId and referralType
        notes: 'Test referral'
      };

      mockRequest.body = incompleteData;

      await referralController.createReferral(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Missing required fields: referredUserId, referralType'
      });
    });

    it('should handle referral creation errors', async () => {
      const referralData = {
        referrerId: 'test-referrer-id',
        referredUserId: 'test-referred-user-id',
        referralType: 'farmer'
      };

      mockRequest.body = referralData;
      mockReferral.create.mockRejectedValue(new Error('Database error'));

      await referralController.createReferral(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error while creating referral'
      });
    });

    it('should validate referral type', async () => {
      const invalidData = {
        referrerId: 'test-referrer-id',
        referredUserId: 'test-referred-user-id',
        referralType: 'invalid_type'
      };

      mockRequest.body = invalidData;

      await referralController.createReferral(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid referral type. Must be one of: farmer, partner, aggregator'
      });
    });
  });

  describe('getReferrals', () => {
    it('should get referrals successfully', async () => {
      const mockReferrals = [
        {
          _id: 'ref-1',
          referrerId: 'user-1',
          referredUserId: 'user-2',
          referralType: 'farmer',
          status: 'pending',
          createdAt: new Date()
        },
        {
          _id: 'ref-2',
          referrerId: 'user-1',
          referredUserId: 'user-3',
          referralType: 'partner',
          status: 'completed',
          createdAt: new Date()
        }
      ];

      mockRequest.query = { referrerId: 'user-1' };

      // Mock successful referral retrieval
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockReferrals)
          })
        })
      });

      mockReferral.find = mockFind;

      await referralController.getReferrals(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockFind).toHaveBeenCalledWith({ referrerId: 'user-1' });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Referrals retrieved successfully',
        data: mockReferrals
      });
    });

    it('should handle missing referrerId parameter', async () => {
      mockRequest.query = {};

      await referralController.getReferrals(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Referrer ID is required'
      });
    });

    it('should handle database errors', async () => {
      mockRequest.query = { referrerId: 'user-1' };

      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockRejectedValue(new Error('Database error'))
          })
        })
      });

      mockReferral.find = mockFind;

      await referralController.getReferrals(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error while retrieving referrals'
      });
    });

    it('should apply filters correctly', async () => {
      mockRequest.query = { 
        referrerId: 'user-1', 
        status: 'pending',
        referralType: 'farmer'
      };

      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([])
          })
        })
      });

      mockReferral.find = mockFind;

      await referralController.getReferrals(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockFind).toHaveBeenCalledWith({
        referrerId: 'user-1',
        status: 'pending',
        referralType: 'farmer'
      });
    });
  });

  describe('updateReferralStatus', () => {
    it('should update referral status successfully', async () => {
      const mockReferralDoc = {
        _id: 'test-referral-id',
        status: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };

      mockRequest.params = { id: 'test-referral-id' };
      mockRequest.body = { status: 'completed' };

      mockReferral.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReferralDoc)
      });

      await referralController.updateReferralStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockReferralDoc.status).toBe('completed');
      expect(mockReferralDoc.save).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Referral status updated successfully',
        data: { id: 'test-referral-id', status: 'completed' }
      });
    });

    it('should handle referral not found', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockRequest.body = { status: 'completed' };

      mockReferral.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      await referralController.updateReferralStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Referral not found'
      });
    });

    it('should handle missing referral ID', async () => {
      mockRequest.params = {};
      mockRequest.body = { status: 'completed' };

      await referralController.updateReferralStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Referral ID is required'
      });
    });

    it('should handle invalid status', async () => {
      mockRequest.params = { id: 'test-referral-id' };
      mockRequest.body = { status: 'invalid_status' };

      await referralController.updateReferralStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid status. Must be one of: pending, completed, rejected'
      });
    });

    it('should handle database errors', async () => {
      const mockReferralDoc = {
        _id: 'test-referral-id',
        status: 'pending',
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      mockRequest.params = { id: 'test-referral-id' };
      mockRequest.body = { status: 'completed' };

      mockReferral.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReferralDoc)
      });

      await referralController.updateReferralStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error while updating referral'
      });
    });
  });

  describe('getReferralStats', () => {
    it('should get referral statistics successfully', async () => {
      const mockStats = [
        { _id: 'pending', count: 5 },
        { _id: 'completed', count: 10 },
        { _id: 'rejected', count: 2 }
      ];

      mockRequest.params = { referrerId: 'user-1' };

      // Mock successful aggregation
      const mockAggregate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStats)
      });

      mockReferral.aggregate = mockAggregate;

      await referralController.getReferralStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockAggregate).toHaveBeenCalledWith([
        { $match: { referrerId: 'user-1' } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Referral statistics retrieved successfully',
        data: {
          total: 17,
          pending: 5,
          completed: 10,
          rejected: 2
        }
      });
    });

    it('should handle missing referrer ID', async () => {
      mockRequest.params = {};

      await referralController.getReferralStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Referrer ID is required'
      });
    });

    it('should handle empty statistics', async () => {
      mockRequest.params = { referrerId: 'user-1' };

      const mockAggregate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      });

      mockReferral.aggregate = mockAggregate;

      await referralController.getReferralStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Referral statistics retrieved successfully',
        data: {
          total: 0,
          pending: 0,
          completed: 0,
          rejected: 0
        }
      });
    });

    it('should handle database errors', async () => {
      mockRequest.params = { referrerId: 'user-1' };

      const mockAggregate = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      mockReferral.aggregate = mockAggregate;

      await referralController.getReferralStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error while retrieving referral statistics'
      });
    });
  });

  describe('deleteReferral', () => {
    it('should delete referral successfully', async () => {
      const mockReferralDoc = {
        _id: 'test-referral-id',
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
      };

      mockRequest.params = { id: 'test-referral-id' };

      mockReferral.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReferralDoc)
      });

      await referralController.deleteReferral(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockReferralDoc.deleteOne).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Referral deleted successfully',
        data: { id: 'test-referral-id' }
      });
    });

    it('should handle referral not found for deletion', async () => {
      mockRequest.params = { id: 'non-existent-id' };

      mockReferral.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      await referralController.deleteReferral(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Referral not found'
      });
    });

    it('should handle missing referral ID for deletion', async () => {
      mockRequest.params = {};

      await referralController.deleteReferral(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Referral ID is required'
      });
    });

    it('should handle database errors during deletion', async () => {
      const mockReferralDoc = {
        _id: 'test-referral-id',
        deleteOne: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      mockRequest.params = { id: 'test-referral-id' };

      mockReferral.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReferralDoc)
      });

      await referralController.deleteReferral(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error while deleting referral'
      });
    });
  });
});
