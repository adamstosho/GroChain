import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { CommissionController } from '../controllers/commission.controller';

const router = Router();

// Get commission summary for authenticated partner
router.get('/summary', authenticateJWT, authorizeRoles('partner', 'admin'), CommissionController.getCommissionSummary);

// Get commission history with pagination
router.get('/history', authenticateJWT, authorizeRoles('partner', 'admin'), CommissionController.getCommissionHistory);

// Request commission withdrawal
router.post('/withdraw', authenticateJWT, authorizeRoles('partner', 'admin'), CommissionController.requestWithdrawal);

// Admin routes
router.get('/all', authenticateJWT, authorizeRoles('admin'), CommissionController.getAllCommissions);
router.post('/process-payment', authenticateJWT, authorizeRoles('admin'), CommissionController.processCommissionPayment);

export default router;
