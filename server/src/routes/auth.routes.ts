import { Router } from 'express';
import { register, login, refresh, forgotPassword, resetPassword, verifyEmail } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);

// Example protected route
router.get('/protected', authenticateJWT, (req, res) => {
  res.json({ status: 'success', message: 'Protected data' });
});

export default router;
