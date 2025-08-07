import { Router } from 'express';
import { register, login, refresh } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

// Example protected route
router.get('/protected', authenticateJWT, authorizeRoles('admin', 'partner'), (req, res) => {
  res.json({ status: 'success', message: 'You have access to this protected route.' });
});

export default router;
