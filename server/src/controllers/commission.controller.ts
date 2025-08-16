import { Request, Response } from 'express';
import { CommissionService } from '../services/commission.service';
import Joi from 'joi';
import { logger } from '../utils/logger';

export class CommissionController {
  // Get commission summary for authenticated partner
  static async getCommissionSummary(req: Request, res: Response) {
    try {
      const { period } = req.query;
      const partnerId = (req as any).user.id;

      const summary = await CommissionService.getPartnerCommissionSummary(
        partnerId, 
        period as 'month' | 'quarter' | 'year'
      );

      return res.status(200).json({
        status: 'success',
        summary
      });
    } catch (error) {
      logger.error('Commission summary error: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get commission summary'
      });
    }
  }

  // Get commission history with pagination
  static async getCommissionHistory(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const partnerId = (req as any).user.id;

      const history = await CommissionService.getPartnerCommissionHistory(
        partnerId,
        parseInt(page as string),
        parseInt(limit as string)
      );

      return res.status(200).json({
        status: 'success',
        history
      });
    } catch (error) {
      logger.error('Commission history error: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get commission history'
      });
    }
  }

  // Request commission withdrawal
  static async requestWithdrawal(req: Request, res: Response) {
    try {
      const { error, value } = Joi.object({
        amount: Joi.number().positive().required()
      }).validate(req.body);

      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }

      const partnerId = (req as any).user.id;
      const { amount } = value;

      const success = await CommissionService.processWithdrawal(partnerId, amount);

      if (success) {
        return res.status(200).json({
          status: 'success',
          message: 'Withdrawal request processed successfully'
        });
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to process withdrawal request'
        });
      }
    } catch (error) {
      logger.error('Withdrawal request error: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to process withdrawal request'
      });
    }
  }

  // Get all commissions (admin only)
  static async getAllCommissions(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, partnerId, status } = req.query;

      const commissions = await CommissionService.getAllCommissions({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        partnerId: partnerId as string,
        status: status as string
      });

      return res.status(200).json({
        status: 'success',
        commissions
      });
    } catch (error) {
      logger.error('Get all commissions error: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get commissions'
      });
    }
  }

  // Process commission payment (admin only)
  static async processCommissionPayment(req: Request, res: Response) {
    try {
      const { error, value } = Joi.object({
        commissionId: Joi.string().required(),
        amount: Joi.number().positive().required(),
        paymentMethod: Joi.string().valid('bank_transfer', 'mobile_money', 'cash').required(),
        reference: Joi.string().required()
      }).validate(req.body);

      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }

      const { commissionId, amount, paymentMethod, reference } = value;

      const success = await CommissionService.processCommissionPayment(
        commissionId,
        amount,
        paymentMethod,
        reference
      );

      if (success) {
        return res.status(200).json({
          status: 'success',
          message: 'Commission payment processed successfully'
        });
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to process commission payment'
        });
      }
    } catch (error) {
      logger.error('Process commission payment error: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to process commission payment'
      });
    }
  }
}
