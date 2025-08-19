import { Router } from 'express';
import { register, login, refresh, forgotPassword, resetPassword, verifyEmail, resendVerificationEmail, sendSmsOtp, verifySmsOtp } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import Joi from 'joi';
import { authenticateJWT, AuthRequest } from '../middlewares/auth.middleware';
import { User } from '../models/user.model';
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
router.post('/resend-verification', validateRequest(Joi.object({ email: Joi.string().email().required() })), resendVerificationEmail);

// SMS OTP endpoints for phone verification
router.post('/send-sms-otp', validateRequest(sendSmsOtpSchema), sendSmsOtp);
router.post('/verify-sms-otp', validateRequest(verifySmsOtpSchema), verifySmsOtp);

// Example protected route
router.get('/protected', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const uid = (req.user as any)?.id
    if (!uid) return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    const user = await User.findById(uid).select('_id name email role phone emailVerified createdAt updatedAt')
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })
    return res.json({ status: 'success', user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: (user as any).phone,
      emailVerified: (user as any).emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } })
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
});

export default router;
