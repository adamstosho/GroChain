import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { CommissionService } from '../services/commission.service';
import Joi from 'joi';

const router = Router();

// Get commission summary for authenticated partner
router.get('/summary', authenticateJWT, authorizeRoles('partner', 'admin'), async (req, res) => {
  try {
    const { period } = req.query;
    const partnerId = (req as any).user.id; // Assuming user ID is the partner ID

    const summary = await CommissionService.getPartnerCommissionSummary(
      partnerId, 
      period as 'month' | 'quarter' | 'year'
    );

    return res.status(200).json({
      status: 'success',
      summary
    });
  } catch (error) {
    console.error('Commission summary error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get commission summary'
    });
  }
});

// Get commission history with pagination
router.get('/history', authenticateJWT, authorizeRoles('partner', 'admin'), async (req, res) => {
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
    console.error('Commission history error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get commission history'
    });
  }
});

// Request commission withdrawal
router.post('/withdraw', authenticateJWT, authorizeRoles('partner', 'admin'), async (req, res) => {
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
    console.error('Withdrawal request error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process withdrawal request'
    });
  }
});

export default router;
