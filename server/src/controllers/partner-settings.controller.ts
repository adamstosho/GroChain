import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { User } from '../models/user.model';
import { Partner } from '../models/partner.model';
import { logger } from '../utils/logger';

export const partnerSettingsController = {
  // Get partner profile
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

      // Check if user is a partner
      if (user.role !== 'partner') {
        return res.status(403).json({ status: 'error', message: 'Access denied. Partner role required.' });
      }

      // Get partner organization details
      const partner = await Partner.findOne({ user: userId });
      const partnerDetails = partner ? {
        organizationName: partner.organizationName,
        organizationType: partner.organizationType,
        registrationNumber: partner.registrationNumber,
        address: partner.address,
        contactPerson: partner.contactPerson,
        phone: partner.phone,
        website: partner.website,
        services: partner.services,
        regions: partner.regions,
        commissionRate: partner.commissionRate,
        status: partner.status
      } : {};

      res.json({
        status: 'success',
        data: {
          id: user._id,
          name: user.name || '',
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified || false,
          phoneVerified: user.phoneVerified || false,
          partner: partnerDetails,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      logger.error('Error getting partner profile:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Update partner profile
  updateMyProfile: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'User not authenticated' });
      }

      const updateData = req.body;
      
      // Update user profile
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

      // Update partner organization details if they exist
      if (updateData.partner) {
        await Partner.findOneAndUpdate(
          { user: userId },
          {
            $set: {
              organizationName: updateData.partner.organizationName,
              organizationType: updateData.partner.organizationType,
              address: updateData.partner.address,
              contactPerson: updateData.partner.contactPerson,
              phone: updateData.partner.phone,
              website: updateData.partner.website
            }
          },
          { upsert: true, new: true }
        );
      }

      res.json({
        status: 'success',
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      logger.error('Error updating partner profile:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Get partner preferences
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
      logger.error('Error getting partner preferences:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Update partner preferences
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
      logger.error('Error updating partner preferences:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Get partner settings
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

      // Get partner organization settings
      const partner = await Partner.findOne({ user: userId });
      const partnerSettings = partner ? {
        services: partner.services || [],
        regions: partner.regions || [],
        commissionRate: partner.commissionRate || 0,
        autoOnboarding: partner.autoOnboarding || false,
        qualityStandards: partner.qualityStandards || [],
        trainingPrograms: partner.trainingPrograms || []
      } : {};

      res.json({
        status: 'success',
        data: {
          organization: partnerSettings,
          notifications: {
            newFarmers: true,
            commissionUpdates: true,
            qualityAlerts: true,
            trainingReminders: true,
            marketUpdates: true
          },
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
          }
        }
      });
    } catch (error) {
      logger.error('Error getting partner settings:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // Update partner settings
  updateMySettings: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'User not authenticated' });
      }

      const updateData = req.body;
      
      // Update partner organization settings if they exist
      if (updateData.organization) {
        await Partner.findOneAndUpdate(
          { user: userId },
          {
            $set: {
              services: updateData.organization.services,
              regions: updateData.organization.regions,
              commissionRate: updateData.organization.commissionRate,
              autoOnboarding: updateData.organization.autoOnboarding,
              qualityStandards: updateData.organization.qualityStandards,
              trainingPrograms: updateData.organization.trainingPrograms
            }
          },
          { upsert: true, new: true }
        );
      }

      res.json({
        status: 'success',
        message: 'Settings updated successfully',
        data: updateData
      });
    } catch (error) {
      logger.error('Error updating partner settings:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};
