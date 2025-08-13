import { Router } from 'express';
import { register, login, refresh, forgotPassword, resetPassword, verifyEmail, sendSmsOtp, verifySmsOtp } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import Joi from 'joi';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';

const router = Router();

// Validation schemas for routes
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('farmer', 'partner', 'aggregator', 'admin', 'buyer').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const tokenSchema = Joi.object({
  token: Joi.string().required(),
});

const sendSmsOtpSchema = Joi.object({
  phone: Joi.string().required(),
});

const verifySmsOtpSchema = Joi.object({
  phone: Joi.string().required(),
  otp: Joi.string().length(6).required(),
});

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh', validateRequest(refreshSchema), refresh);
router.post('/forgot-password', validateRequest(Joi.object({ email: Joi.string().email().required() })), forgotPassword);
router.post('/reset-password', validateRequest(Joi.object({ token: Joi.string().required(), password: Joi.string().min(6).required() })), resetPassword);
router.post('/verify-email', validateRequest(tokenSchema), verifyEmail);

// SMS OTP endpoints for phone verification
router.post('/send-sms-otp', validateRequest(sendSmsOtpSchema), sendSmsOtp);
router.post('/verify-sms-otp', validateRequest(verifySmsOtpSchema), verifySmsOtp);

// Example protected route
router.get('/protected', authenticateJWT, (req, res) => {
  res.json({ status: 'success', message: 'Protected data' });
});

export default router;
