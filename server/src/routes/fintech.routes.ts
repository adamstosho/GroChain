import { Router } from 'express';
import { 
  getCreditScore, 
  createLoanReferral,
  getLoanApplications, 
  createLoanApplication, 
  getLoanStats,
  getInsurancePolicies,
  getInsuranceStats,
  createInsuranceQuote,
  createInsuranceClaim,
  getFinancialHealth,
  getCropFinancials,
  getFinancialProjections,
  createFinancialGoal
} from '../controllers/fintech.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import Joi from 'joi';

const router = Router();

// Only the farmer themself, a partner, or an admin can access a credit score
router.get(
  '/credit-score/:farmerId',
  authenticateJWT,
  authorizeRoles('farmer', 'partner', 'admin'),
  getCreditScore
);
// Convenience alias for current user
router.get(
  '/credit-score/me',
  authenticateJWT,
  authorizeRoles('farmer', 'partner', 'admin'),
  (req, res, next) => {
    // Delegate to the same controller with farmerId = 'me'
    (req as any).params.farmerId = 'me';
    return (getCreditScore as any)(req, res, next);
  }
);

// Only partners or admins can create loan referrals
router.post(
  '/loan-referrals',
  authenticateJWT,
  authorizeRoles('partner', 'admin'),
  validateRequest(Joi.object({ farmer: Joi.string().required(), amount: Joi.number().positive().required(), partner: Joi.string().required() })),
  createLoanReferral
);

// Loan Management Endpoints
router.get(
  '/loan-applications',
  authenticateJWT,
  authorizeRoles('farmer', 'partner', 'admin'),
  getLoanApplications
);

router.post(
  '/loan-applications',
  authenticateJWT,
  authorizeRoles('farmer', 'partner', 'admin'),
  validateRequest(Joi.object({
    amount: Joi.number().positive().required(),
    purpose: Joi.string().required(),
    term: Joi.number().integer().min(6).max(60).required(),
    description: Joi.string().optional()
  })),
  createLoanApplication
);

router.get(
  '/loan-stats',
  authenticateJWT,
  authorizeRoles('partner', 'admin'),
  getLoanStats
);

// Insurance Management Endpoints
router.get(
  '/insurance-policies',
  authenticateJWT,
  authorizeRoles('farmer', 'partner', 'admin'),
  getInsurancePolicies
);

router.get(
  '/insurance-stats',
  authenticateJWT,
  authorizeRoles('partner', 'admin'),
  getInsuranceStats
);

router.post(
  '/insurance-quotes',
  authenticateJWT,
  authorizeRoles('farmer', 'partner', 'admin'),
  validateRequest(Joi.object({
    type: Joi.string().required(),
    coverage: Joi.string().required(),
    description: Joi.string().optional(),
    location: Joi.string().required()
  })),
  createInsuranceQuote
);

router.post(
  '/insurance-claims',
  authenticateJWT,
  authorizeRoles('farmer', 'partner', 'admin'),
  validateRequest(Joi.object({
    policyId: Joi.string().required(),
    amount: Joi.string().required(),
    description: Joi.string().required(),
    incidentDate: Joi.string().required()
  })),
  createInsuranceClaim
);

// Financial Tools Endpoints
router.get(
  '/financial-health',
  authenticateJWT,
  authorizeRoles('farmer', 'partner', 'admin'),
  getFinancialHealth
);

router.get(
  '/crop-financials',
  authenticateJWT,
  authorizeRoles('farmer', 'partner', 'admin'),
  getCropFinancials
);

router.get(
  '/financial-projections',
  authenticateJWT,
  authorizeRoles('farmer', 'partner', 'admin'),
  getFinancialProjections
);

router.post(
  '/financial-goals',
  authenticateJWT,
  authorizeRoles('farmer', 'partner', 'admin'),
  validateRequest(Joi.object({
    name: Joi.string().required(),
    targetAmount: Joi.string().required(),
    targetDate: Joi.string().required(),
    priority: Joi.string().valid('high', 'medium', 'low').default('medium'),
    category: Joi.string().required()
  })),
  createFinancialGoal
);

export default router;
