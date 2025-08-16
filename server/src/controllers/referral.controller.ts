import { Request, Response } from 'express';
import { Referral } from '../models/referral.model';
import { logger } from '../utils/logger';

export class ReferralController {
  /**
   * Create a new referral
   * POST /api/referrals
   */
  async createReferral(req: Request, res: Response): Promise<void> {
    try {
      const { referrerId, referredUserId, referralType, notes } = req.body;

      // Validate required fields
      const requiredFields = ['referrerId', 'referredUserId', 'referralType'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        res.status(400).json({
          status: 'error',
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
        return;
      }

      // Validate referral type
      const validTypes = ['farmer', 'partner', 'aggregator'];
      if (!validTypes.includes(referralType)) {
        res.status(400).json({
          status: 'error',
          message: `Invalid referral type. Must be one of: ${validTypes.join(', ')}`
        });
        return;
      }

      // Create referral
      const referral = await Referral.create({
        referrerId,
        referredUserId,
        referralType,
        notes,
        status: 'pending',
        createdAt: new Date()
      });

      res.status(201).json({
        status: 'success',
        message: 'Referral created successfully',
        data: referral
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error creating referral');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while creating referral'
      });
    }
  }

  /**
   * Get referrals for a referrer
   * GET /api/referrals
   */
  async getReferrals(req: Request, res: Response): Promise<void> {
    try {
      const { referrerId, status, referralType, limit = 20, offset = 0 } = req.query;

      if (!referrerId) {
        res.status(400).json({
          status: 'error',
          message: 'Referrer ID is required'
        });
        return;
      }

      // Build query
      const query: any = { referrerId: referrerId as string };
      if (status) query.status = status;
      if (referralType) query.referralType = referralType;

      // Get referrals with pagination
      const referrals = await Referral.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(offset))
        .exec();

      res.status(200).json({
        status: 'success',
        message: 'Referrals retrieved successfully',
        data: referrals
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error retrieving referrals');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while retrieving referrals'
      });
    }
  }

  /**
   * Update referral status
   * PUT /api/referrals/:id/status
   */
  async updateReferralStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        res.status(400).json({
          status: 'error',
          message: 'Referral ID is required'
        });
        return;
      }

      if (!status) {
        res.status(400).json({
          status: 'error',
          message: 'Status is required'
        });
        return;
      }

      // Validate status
      const validStatuses = ['pending', 'completed', 'rejected'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          status: 'error',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
        return;
      }

      const referral = await Referral.findById(id).exec();
      
      if (!referral) {
        res.status(404).json({
          status: 'error',
          message: 'Referral not found'
        });
        return;
      }

      referral.status = status;
      referral.updatedAt = new Date();
      await referral.save();

      res.status(200).json({
        status: 'success',
        message: 'Referral status updated successfully',
        data: { id, status }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error updating referral');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while updating referral'
      });
    }
  }

  /**
   * Get referral statistics for a referrer
   * GET /api/referrals/stats/:referrerId
   */
  async getReferralStats(req: Request, res: Response): Promise<void> {
    try {
      const { referrerId } = req.params;

      if (!referrerId) {
        res.status(400).json({
          status: 'error',
          message: 'Referrer ID is required'
        });
        return;
      }

      const stats = await Referral.aggregate([
        { $match: { referrerId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const result = {
        total: 0,
        pending: 0,
        completed: 0,
        rejected: 0
      };

      stats.forEach(stat => {
        result.total += stat.count;
        if (stat._id) {
          result[stat._id as keyof typeof result] = stat.count;
        }
      });

      res.status(200).json({
        status: 'success',
        message: 'Referral statistics retrieved successfully',
        data: result
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error retrieving referral statistics');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while retrieving referral statistics'
      });
    }
  }

  /**
   * Delete a referral
   * DELETE /api/referrals/:id
   */
  async deleteReferral(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          status: 'error',
          message: 'Referral ID is required'
        });
        return;
      }

      const referral = await Referral.findById(id).exec();
      
      if (!referral) {
        res.status(404).json({
          status: 'error',
          message: 'Referral not found'
        });
        return;
      }

      await referral.deleteOne();

      res.status(200).json({
        status: 'success',
        message: 'Referral deleted successfully',
        data: { id }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error deleting referral');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while deleting referral'
      });
    }
  }

  /**
   * Get referral by ID
   * GET /api/referrals/:id
   */
  async getReferralById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          status: 'error',
          message: 'Referral ID is required'
        });
        return;
      }

      const referral = await Referral.findById(id).exec();
      
      if (!referral) {
        res.status(404).json({
          status: 'error',
          message: 'Referral not found'
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        message: 'Referral retrieved successfully',
        data: referral
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error retrieving referral');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while retrieving referral'
      });
    }
  }

  /**
   * Get all referrals (admin only)
   * GET /api/referrals/all
   */
  async getAllReferrals(req: Request, res: Response): Promise<void> {
    try {
      const { status, referralType, limit = 50, offset = 0 } = req.query;

      // Build query
      const query: any = {};
      if (status) query.status = status;
      if (referralType) query.referralType = referralType;

      // Get referrals with pagination
      const referrals = await Referral.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(offset))
        .exec();

      const total = await Referral.countDocuments(query);

      res.status(200).json({
        status: 'success',
        message: 'All referrals retrieved successfully',
        data: {
          referrals,
          pagination: {
            total,
            limit: Number(limit),
            offset: Number(offset),
            hasMore: total > Number(limit) + Number(offset)
          }
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error retrieving all referrals');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while retrieving all referrals'
      });
    }
  }

  /**
   * Complete a referral
   * POST /api/referrals/:farmerId/complete
   */
  async completeReferral(req: Request, res: Response): Promise<void> {
    try {
      const { farmerId } = req.params;
      const { transactionAmount, transactionId } = req.body;

      if (!farmerId || !transactionAmount || !transactionId) {
        res.status(400).json({
          status: 'error',
          message: 'Farmer ID, transaction amount, and transaction ID are required'
        });
        return;
      }

      // Find the referral for this farmer
      const referral = await Referral.findOne({
        referredUserId: farmerId,
        status: 'pending'
      }).exec();

      if (!referral) {
        res.status(404).json({
          status: 'error',
          message: 'No pending referral found for this farmer'
        });
        return;
      }

      // Complete the referral using the model method
      await (referral as any).completeReferral(transactionAmount, transactionId);

      res.status(200).json({
        status: 'success',
        message: 'Referral completed successfully',
        data: referral
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error completing referral');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error while completing referral'
      });
    }
  }
}

export const referralController = new ReferralController();
