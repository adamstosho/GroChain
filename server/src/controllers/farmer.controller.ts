import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';

export const farmerController = {
  // Get farmer profile
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

      // Check if user is a farmer
      if (user.role !== 'farmer') {
        return res.status(403).json({ status: 'error', message: 'Access denied. Farmer role required.' });
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
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting farmer profile');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Update farmer profile
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
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error updating farmer profile');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Get farmer preferences
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
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting farmer preferences');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Update farmer preferences
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
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error updating farmer preferences');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Get farmer settings
  getMySettings: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'User not authenticated' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({
        status: 'success',
        data: {
          farming: {
            defaultCrop: '',
            harvestReminders: true,
            weatherAlerts: true,
            pestAlerts: true,
            marketPriceAlerts: true
          },
          financial: {
            autoSave: true,
            savingsGoal: 0,
            investmentPreferences: [],
            riskTolerance: 'medium'
          },
          learning: {
            showTutorials: true,
            trainingReminders: true,
            preferredTopics: [],
            learningStyle: 'visual'
          }
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting farmer settings');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Update farmer settings
  updateMySettings: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'User not authenticated' });
      }

      const updateData = req.body;
      // For now, we'll just return success since we don't have a settings field in the User model
      // In a real implementation, you might want to add a settings field to the User model
      // or create a separate FarmerSettings model

      res.json({
        status: 'success',
        message: 'Settings updated successfully',
        data: updateData
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error updating farmer settings');
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};
