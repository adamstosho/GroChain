import express from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { userController } from '../controllers/user.controller';
import { userValidation } from '../validations/user.validation';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// User Overview & Analytics
router.get('/overview', 
  authorizeRoles(['admin', 'manager']), 
  userController.getUserOverview
);

router.get('/dashboard', 
  authorizeRoles(['admin', 'manager']), 
  userController.getUserDashboard
);

// User Management CRUD
router.get('/', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.getUsers,
  validateRequest,
  userController.getUsers
);

router.get('/:userId', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.getUser,
  validateRequest,
  userController.getUser
);

router.post('/', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.createUser,
  validateRequest,
  userController.createUser
);

router.put('/:userId', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.updateUser,
  validateRequest,
  userController.updateUser
);

router.delete('/:userId', 
  authorizeRoles(['admin']), 
  userValidation.deleteUser,
  validateRequest,
  userController.deleteUser
);

// User Profile Management
router.get('/profile/me', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer', 'aggregator']), 
  userController.getMyProfile
);

router.put('/profile/me', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer', 'aggregator']), 
  userValidation.updateProfile,
  validateRequest,
  userController.updateMyProfile
);

router.put('/profile/:userId', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.updateProfile,
  validateRequest,
  userController.updateUserProfile
);

// User Authentication & Security
router.post('/:userId/change-password', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.changePassword,
  validateRequest,
  userController.changeUserPassword
);

router.post('/:userId/reset-password', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.resetPassword,
  validateRequest,
  userController.resetUserPassword
);

router.post('/:userId/force-logout', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.forceLogout,
  validateRequest,
  userController.forceUserLogout
);

// User Status Management
router.patch('/:userId/activate', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.activateUser,
  validateRequest,
  userController.activateUser
);

router.patch('/:userId/deactivate', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.deactivateUser,
  validateRequest,
  userController.deactivateUser
);

router.patch('/:userId/suspend', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.suspendUser,
  validateRequest,
  userController.suspendUser
);

router.patch('/:userId/unsuspend', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.unsuspendUser,
  validateRequest,
  userController.unsuspendUser
);

// Role & Permission Management
router.get('/:userId/roles', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.getUserRoles,
  validateRequest,
  userController.getUserRoles
);

router.post('/:userId/roles', 
  authorizeRoles(['admin']), 
  userValidation.assignRole,
  validateRequest,
  userController.assignRole
);

router.delete('/:userId/roles/:roleId', 
  authorizeRoles(['admin']), 
  userValidation.removeRole,
  validateRequest,
  userController.removeRole
);

router.get('/:userId/permissions', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.getUserPermissions,
  validateRequest,
  userController.getUserPermissions
);

// User Groups & Teams
router.get('/groups', 
  authorizeRoles(['admin', 'manager']), 
  userController.getUserGroups
);

router.get('/groups/:groupId', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.getUserGroup,
  validateRequest,
  userController.getUserGroup
);

router.post('/groups', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.createUserGroup,
  validateRequest,
  userController.createUserGroup
);

router.put('/groups/:groupId', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.updateUserGroup,
  validateRequest,
  userController.updateUserGroup
);

router.delete('/groups/:groupId', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.deleteUserGroup,
  validateRequest,
  userController.deleteUserGroup
);

router.post('/groups/:groupId/users', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.addUserToGroup,
  validateRequest,
  userController.addUserToGroup
);

router.delete('/groups/:groupId/users/:userId', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.removeUserFromGroup,
  validateRequest,
  userController.removeUserFromGroup
);

// User Activity & Audit
router.get('/:userId/activity', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.getUserActivity,
  validateRequest,
  userController.getUserActivity
);

router.get('/:userId/login-history', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.getLoginHistory,
  validateRequest,
  userController.getUserLoginHistory
);

router.get('/:userId/audit-trail', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.getAuditTrail,
  validateRequest,
  userController.getUserAuditTrail
);

// User Preferences & Settings
router.get('/:userId/preferences', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer', 'aggregator']), 
  userValidation.getUserPreferences,
  validateRequest,
  userController.getUserPreferences
);

router.put('/:userId/preferences', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer', 'aggregator']), 
  userValidation.updateUserPreferences,
  validateRequest,
  userController.updateUserPreferences
);

router.get('/:userId/settings', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer', 'aggregator']), 
  userValidation.getUserSettings,
  validateRequest,
  userController.getUserSettings
);

router.put('/:userId/settings', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer', 'aggregator']), 
  userValidation.updateUserSettings,
  validateRequest,
  userController.updateUserSettings
);

// User Notifications & Communication
router.get('/:userId/notifications', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer', 'aggregator']), 
  userValidation.getUserNotifications,
  validateRequest,
  userController.getUserNotifications
);

router.patch('/:userId/notifications/:notificationId/read', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer', 'aggregator']), 
  userValidation.markNotificationRead,
  validateRequest,
  userController.markNotificationRead
);

router.patch('/:userId/notifications/read-all', 
  authorizeRoles(['admin', 'manager', 'partner', 'farmer', 'buyer', 'aggregator']), 
  userValidation.markAllNotificationsRead,
  validateRequest,
  userController.markAllNotificationsRead
);

// User Data Export & Import
router.post('/export', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.exportUsers,
  validateRequest,
  userController.exportUsers
);

router.post('/import', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.importUsers,
  validateRequest,
  userController.importUsers
);

router.post('/bulk-update', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.bulkUpdateUsers,
  validateRequest,
  userController.bulkUpdateUsers
);

// User Search & Filter
router.get('/search', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.searchUsers,
  validateRequest,
  userController.searchUsers
);

router.get('/filter', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.filterUsers,
  validateRequest,
  userController.filterUsers
);

// User Statistics & Metrics
router.get('/stats/overall', 
  authorizeRoles(['admin', 'manager']), 
  userController.getOverallUserStats
);

router.get('/stats/by-role', 
  authorizeRoles(['admin', 'manager']), 
  userController.getUserStatsByRole
);

router.get('/stats/by-status', 
  authorizeRoles(['admin', 'manager']), 
  userController.getUserStatsByStatus
);

router.get('/stats/trends', 
  authorizeRoles(['admin', 'manager']), 
  userController.getUserTrends
);

// User Verification & KYC
router.get('/:userId/verification', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.getUserVerification,
  validateRequest,
  userController.getUserVerification
);

router.post('/:userId/verification', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.verifyUser,
  validateRequest,
  userController.verifyUser
);

router.post('/:userId/verification/reject', 
  authorizeRoles(['admin', 'manager']), 
  userValidation.rejectVerification,
  validateRequest,
  userController.rejectUserVerification
);

export default router;
