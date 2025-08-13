import { Router } from 'express';
import { getCreditScore, createLoanReferral } from '../controllers/fintech.controller';
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

// Only partners or admins can create loan referrals
router.post(
  '/loan-referrals',
  authenticateJWT,
  authorizeRoles('partner', 'admin'),
  validateRequest(Joi.object({ farmer: Joi.string().required(), amount: Joi.number().positive().required(), partner: Joi.string().required() })),
  createLoanReferral
);

export default router;
