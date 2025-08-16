import { Router } from 'express';
import { referralController } from '../controllers/referral.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';

const router = Router();

// Completing referrals should be restricted to partners or admins
router.post(
  '/:farmerId/complete',
  authenticateJWT,
  authorizeRoles('partner', 'admin'),
  referralController.completeReferral.bind(referralController)
);

export default router;
