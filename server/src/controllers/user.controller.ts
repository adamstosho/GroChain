import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { User } from '../models/user.model';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

export const userController = {
  // User Overview & Analytics
  getUserOverview: async (req: AuthRequest, res: Response) => {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ status: 'active' });
      const pendingUsers = await User.countDocuments({ status: 'pending' });
      const suspendedUsers = await User.countDocuments({ status: 'suspended' });

      const roleStats = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);

      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role status createdAt');

      res.json({
        status: 'success',
        data: {
          totalUsers,
          activeUsers,
          pendingUsers,
          suspendedUsers,
          roleStats,
          recentUsers
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting user overview:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  getUserDashboard: async (req: AuthRequest, res: Response) => {
    try {
      res.json({ status: 'success', message: 'User dashboard data' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // User Management CRUD
  getUsers: async (req: AuthRequest, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        role,
        status,
        region,
        search
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      
      // Build filter object
      const filter: any = {};
      
      if (role && role !== 'all') {
        filter.role = role;
      }
      
      if (status && status !== 'all') {
        filter.status = status;
      }
      
      if (region) {
        filter.location = { $regex: region, $options: 'i' };
      }
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ];
      }

      const users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const totalUsers = await User.countDocuments(filter);
      const totalPages = Math.ceil(totalUsers / Number(limit));

      res.json({
        status: 'success',
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            totalUsers,
            totalPages
          }
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting users:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  getUser: async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({
        status: 'success',
        data: user
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting user:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  createUser: async (req: AuthRequest, res: Response) => {
    try {
      const { email, password: userPassword, role, profile, partnerId } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ status: 'error', message: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userPassword, 12);

      // Create user
      const userData: any = {
        email,
        password: hashedPassword,
        role,
        status: 'pending',
        emailVerified: false,
        phoneVerified: false
      };

      if (profile) {
        userData.name = profile.fullName;
        userData.phone = profile.phone;
        userData.location = profile.location;
        userData.gender = profile.gender;
        userData.age = profile.age;
        userData.education = profile.education;
      }

      if (partnerId && role === 'farmer') {
        userData.partner = partnerId;
      }

      const user = new User(userData);
      await user.save();

      const userResponse = user.toObject();
      const { password, ...userWithoutPassword } = userResponse;

      res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error creating user:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  updateUser: async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      // Update fields
      if (updateData.profile) {
        if (updateData.profile.fullName) user.name = updateData.profile.fullName;
        if (updateData.profile.phone) user.phone = updateData.profile.phone;
        if (updateData.profile.location) user.location = updateData.profile.location;
        if (updateData.profile.gender) user.gender = updateData.profile.gender;
        if (updateData.profile.age) user.age = updateData.profile.age;
        if (updateData.profile.education) user.education = updateData.profile.education;
      }

      if (updateData.isActive !== undefined) {
        user.status = updateData.isActive ? 'active' : 'inactive';
      }

      if (updateData.isVerified !== undefined) {
        user.emailVerified = updateData.isVerified;
      }

      if (updateData.role) {
        user.role = updateData.role;
      }

      await user.save();

      const userResponse = user.toObject();
      const { password, ...userWithoutPassword } = userResponse;

      res.json({
        status: 'success',
        message: 'User updated successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error updating user:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  deleteUser: async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      // Prevent deletion of admin users
      if (user.role === 'admin') {
        return res.status(400).json({ status: 'error', message: 'Cannot delete admin users' });
      }

      await User.findByIdAndDelete(userId);

      res.json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error deleting user:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Bulk Operations
  bulkCreateUsers: async (req: AuthRequest, res: Response) => {
    try {
      const { users } = req.body;

      const createdUsers = [];
      const errors = [];

      for (const userData of users) {
        try {
          const existingUser = await User.findOne({ email: userData.email });
          if (existingUser) {
            errors.push({ email: userData.email, error: 'User already exists' });
            continue;
          }

          const hashedPassword = await bcrypt.hash(userData.password, 12);
          const user = new User({
            ...userData,
            password: hashedPassword,
            status: 'pending'
          });

          await user.save();
          const userResponse = user.toObject();
          const { password, ...userWithoutPassword } = userResponse;
          createdUsers.push(userWithoutPassword);
        } catch (error) {
          errors.push({ email: userData.email, error: 'Failed to create user' });
        }
      }

      res.json({
        status: 'success',
        message: `Created ${createdUsers.length} users successfully`,
        data: {
          created: createdUsers,
          errors
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error bulk creating users:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  bulkUpdateUsers: async (req: AuthRequest, res: Response) => {
    try {
      const { updates } = req.body;

      const updatedUsers = [];
      const errors = [];

      for (const update of updates) {
        try {
          const user = await User.findByIdAndUpdate(
            update.userId,
            update.data,
            { new: true, runValidators: true }
          ).select('-password');

          if (!user) {
            errors.push({ userId: update.userId, error: 'User not found' });
            continue;
          }

          updatedUsers.push(user);
        } catch (error) {
          errors.push({ userId: update.userId, error: 'Failed to update user' });
        }
      }

      res.json({
        status: 'success',
        message: `Updated ${updatedUsers.length} users successfully`,
        data: {
          updated: updatedUsers,
          errors
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error bulk updating users:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  bulkDeleteUsers: async (req: AuthRequest, res: Response) => {
    try {
      const { userIds } = req.body;

      const deletedUsers = [];
      const errors = [];

      for (const userId of userIds) {
        try {
          const user = await User.findById(userId);
          if (!user) {
            errors.push({ userId, error: 'User not found' });
            continue;
          }

          if (user.role === 'admin') {
            errors.push({ userId, error: 'Cannot delete admin users' });
            continue;
          }

          await User.findByIdAndDelete(userId);
          deletedUsers.push(userId);
        } catch (error) {
          errors.push({ userId, error: 'Failed to delete user' });
        }
      }

      res.json({
        status: 'success',
        message: `Deleted ${deletedUsers.length} users successfully`,
        data: {
          deleted: deletedUsers,
          errors
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error bulk deleting users:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // User Search & Statistics
  searchUsers: async (req: AuthRequest, res: Response) => {
    try {
      const { query, role, status, limit = 10 } = req.query;

      const filter: any = {};

      if (query) {
        filter.$or = [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { location: { $regex: query, $options: 'i' } }
        ];
      }

      if (role && role !== 'all') {
        filter.role = role;
      }

      if (status && status !== 'all') {
        filter.status = status;
      }

      const users = await User.find(filter)
        .select('name email role status location createdAt')
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      res.json({
        status: 'success',
        data: users
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error searching users:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  getUserStats: async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      // Get user statistics (this would include harvests, orders, etc.)
      const stats = {
        totalHarvests: 0, // TODO: Implement harvest counting
        totalOrders: 0,   // TODO: Implement order counting
        totalRevenue: 0,  // TODO: Implement revenue calculation
        lastActivity: user.updatedAt,
        profileCompletion: user.emailVerified && user.phoneVerified ? 100 : 50
      };

      res.json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting user stats:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  getUserActivity: async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      // TODO: Implement user activity tracking
      const activities = [
        {
          type: 'login',
          timestamp: user.updatedAt,
          description: 'User logged in'
        }
      ];

      res.json({
        status: 'success',
        data: activities
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting user activity:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // User Verification & Management
  verifyUser: async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      user.emailVerified = true;
      user.status = 'active';
      await user.save();

      const userResponse = user.toObject();
      const { password, ...userWithoutPassword } = userResponse;

      res.json({
        status: 'success',
        message: 'User verified successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error verifying user:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  suspendUser: async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      if (user.role === 'admin') {
        return res.status(400).json({ status: 'error', message: 'Cannot suspend admin users' });
      }

      user.status = 'suspended';
      user.suspensionReason = reason;
      user.suspendedAt = new Date();
      await user.save();

      const userResponse = user.toObject();
      const { password, ...userWithoutPassword } = userResponse;

      res.json({
        status: 'success',
        message: 'User suspended successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error suspending user:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  reactivateUser: async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      user.status = 'active';
      user.suspensionReason = undefined;
      user.suspendedAt = undefined;
      await user.save();

      const userResponse = user.toObject();
      const { password, ...userWithoutPassword } = userResponse;

      res.json({
        status: 'success',
        message: 'User reactivated successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error reactivating user:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  changeUserRole: async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      user.role = role;
      await user.save();

      const userResponse = user.toObject();
      const { password, ...userWithoutPassword } = userResponse;

      res.json({
        status: 'success',
        message: 'User role changed successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error changing user role:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Data Export
  exportUsers: async (req: AuthRequest, res: Response) => {
    try {
      const { format = 'json', role, status } = req.query;

      const filter: any = {};
      
      if (role && role !== 'all') {
        filter.role = role;
      }
      
      if (status && status !== 'all') {
        filter.status = status;
      }

      const users = await User.find(filter).select('-password');

      if (format === 'csv') {
        // TODO: Implement CSV export
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        res.send('CSV export not implemented yet');
      } else {
        res.json({
          status: 'success',
          data: users
        });
      }
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error exporting users:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Profile Management
  getMyProfile: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'User not authenticated' });
      }

      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({
        status: 'success',
        data: {
          id: user._id,
          name: user.name || '',
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          partner: user.partner,
          emailVerified: user.emailVerified || false,
          phoneVerified: user.phoneVerified || false,
          pushToken: user.pushToken || '',
          notificationPreferences: user.notificationPreferences || {},
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting user profile:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  updateMyProfile: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'User not authenticated' });
      }

      const updateData = req.body;
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          $set: { 
            name: updateData.name,
            phone: updateData.phone
          }
        },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({
        status: 'success',
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error updating user profile:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Preferences Management
  getMyPreferences: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'User not authenticated' });
      }

      const user = await User.findById(userId).select('notificationPreferences');
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({
        status: 'success',
        data: {
          theme: 'light', // Default theme
          language: 'en', // Default language
          notifications: user.notificationPreferences || {},
          privacy: {
            profileVisibility: 'public',
            dataSharing: true,
            analytics: true,
            locationSharing: false
          }
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting user preferences:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  updateMyPreferences: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'User not authenticated' });
      }

      const updateData = req.body;
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          $set: { 
            notificationPreferences: updateData.notifications
          }
        },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({
        status: 'success',
        message: 'Preferences updated successfully',
        data: user
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error updating user preferences:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Settings Management
  getMySettings: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'User not authenticated' });
      }

      const user = await User.findById(userId).select('settings');
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({
        status: 'success',
        data: {
          security: {
            twoFactorEnabled: false,
            loginNotifications: true,
            sessionTimeout: 60,
            passwordExpiry: 90
          },
          display: {
            compactMode: false,
            showTutorials: true,
            autoSave: true,
            defaultCurrency: 'NGN'
          },
          performance: {
            cacheEnabled: true,
            offlineMode: false,
            syncFrequency: 'realtime'
          }
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting user settings');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  updateMySettings: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'User not authenticated' });
      }

      const updateData = req.body;
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          $set: { 
            'settings.security': updateData.security,
            'settings.display': updateData.display,
            'settings.performance': updateData.performance
          }
        },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({
        status: 'success',
        message: 'Settings updated successfully',
        data: user
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error updating user settings');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Password Management
  changePassword: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'User not authenticated' });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ status: 'error', message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update password
      user.password = hashedPassword;
      await user.save();

      res.json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error changing password');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  resetPassword: async (req: AuthRequest, res: Response) => {
    try {
      const { email, resetToken, newPassword } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      // In a real implementation, you would verify the reset token
      // For now, we'll just update the password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();

      res.json({
        status: 'success',
        message: 'Password reset successfully'
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error resetting password:');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};
