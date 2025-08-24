import { Router } from 'express';
import { initializeOrderPayment, verifyPaymentWebhook } from '../controllers/payment.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import Joi from 'joi';

const router = Router();

// Only authenticated buyers/partners/admins should initialize payments
router.post(
  '/initialize',
  authenticateJWT,
  authorizeRoles('buyer', 'partner', 'admin'),
  validateRequest(Joi.object({ orderId: Joi.string().required(), email: Joi.string().email().required() })),
  initializeOrderPayment
);
router.post('/verify', (req, _res, next) => { try { console.log('payment.verify route hit body=', req.body); } catch (error) { console.error('Error in payment verify route:', error); } finally { next(); } }, verifyPaymentWebhook);

export default router;
