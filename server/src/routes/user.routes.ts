import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { userController } from '../controllers/user.controller';
import { userValidation } from '../validations/user.validation';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// User Overview & Analytics
router.get('/overview', 
  authorize(['admin']), 
  userController.getUserOverview
);

router.get('/dashboard', 
  authorize(['admin', 'partner', 'farmer', 'buyer']), 
  userController.getUserDashboard
);

// User Management CRUD
router.get('/', 
  authorize(['admin']), 
  validateRequest(userValidation.getUsers),
  userController.getUsers
);

router.get('/:userId', 
  authorize(['admin']), 
  validateRequest(userValidation.getUser),
  userController.getUser
);

router.post('/', 
  authorize(['admin']), 
  validateRequest(userValidation.createUser),
  userController.createUser
);

router.put('/:userId', 
  authorize(['admin']), 
  validateRequest(userValidation.updateUser),
  userController.updateUser
);

router.delete('/:userId', 
  authorize(['admin']), 
  validateRequest(userValidation.deleteUser),
  userController.deleteUser
);

// Bulk Operations
router.post('/bulk-create', 
  authorize(['admin']), 
  validateRequest(userValidation.bulkCreateUsers),
  userController.bulkCreateUsers
);

router.put('/bulk-update', 
  authorize(['admin']), 
  validateRequest(userValidation.bulkUpdateUsers),
  userController.bulkUpdateUsers
);

router.delete('/bulk-delete', 
  authorize(['admin']), 
  validateRequest(userValidation.bulkDeleteUsers),
  userController.bulkDeleteUsers
);

// User Search & Statistics
router.get('/search', 
  authorize(['admin']), 
  validateRequest(userValidation.searchUsers),
  userController.searchUsers
);

router.get('/:userId/stats', 
  authorize(['admin']), 
  validateRequest(userValidation.getUserStats),
  userController.getUserStats
);

router.get('/:userId/activity', 
  authorize(['admin']), 
  validateRequest(userValidation.getUserActivity),
  userController.getUserActivity
);

// User Verification & Management
router.post('/:userId/verify', 
  authorize(['admin']), 
  validateRequest(userValidation.verifyUser),
  userController.verifyUser
);

router.patch('/:userId/suspend', 
  authorize(['admin']), 
  validateRequest(userValidation.suspendUser),
  userController.suspendUser
);

router.patch('/:userId/reactivate', 
  authorize(['admin']), 
  validateRequest(userValidation.reactivateUser),
  userController.reactivateUser
);

router.patch('/:userId/role', 
  authorize(['admin']), 
  validateRequest(userValidation.changeUserRole),
  userController.changeUserRole
);

// Data Export
router.post('/export', 
  authorize(['admin', 'manager']), 
  validateRequest(userValidation.exportUsers),
  userController.exportUsers
);

// User Profile & Settings
router.get('/profile/me', 
  authorize(['admin', 'partner', 'farmer', 'buyer']), 
  userController.getMyProfile
);

router.put('/profile/me', 
  authorize(['admin', 'partner', 'farmer', 'buyer']), 
  validateRequest(userValidation.updateProfile),
  userController.updateMyProfile
);

router.get('/preferences/me', 
  authorize(['admin', 'partner', 'farmer', 'buyer']), 
  userController.getMyPreferences
);

router.put('/preferences/me', 
  authorize(['admin', 'partner', 'farmer', 'buyer']), 
  validateRequest(userValidation.updatePreferences),
  userController.updateMyPreferences
);

router.get('/settings/me', 
  authorize(['admin', 'partner', 'farmer', 'buyer']), 
  userController.getMySettings
);

router.put('/settings/me', 
  authorize(['admin', 'partner', 'farmer', 'buyer']), 
  validateRequest(userValidation.updateSettings),
  userController.updateMySettings
);

router.post('/change-password', 
  authorize(['admin', 'partner', 'farmer', 'buyer']), 
  validateRequest(userValidation.changePassword),
  userController.changePassword
);

router.post('/reset-password', 
  authorize(['admin', 'partner', 'farmer', 'buyer']), 
  validateRequest(userValidation.resetPassword),
  userController.resetPassword
);

export default router;
