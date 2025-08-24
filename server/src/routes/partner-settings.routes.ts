import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { partnerSettingsController } from '../controllers/partner-settings.controller';
import { partnerSettingsValidation } from '../validations/partner-settings.validation';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Partner Profile & Settings
router.get('/profile/me',
  authorize(['partner']),
  partnerSettingsController.getMyProfile
);

router.put('/profile/me',
  authorize(['partner']),
  validateRequest(partnerSettingsValidation.updateProfile),
  partnerSettingsController.updateMyProfile
);

router.get('/preferences/me',
  authorize(['partner']),
  partnerSettingsController.getMyPreferences
);

router.put('/preferences/me',
  authorize(['partner']),
  validateRequest(partnerSettingsValidation.updatePreferences),
  partnerSettingsController.updateMyPreferences
);

router.get('/settings/me',
  authorize(['partner']),
  partnerSettingsController.getMySettings
);

router.put('/settings/me',
  authorize(['partner']),
  validateRequest(partnerSettingsValidation.updateSettings),
  partnerSettingsController.updateMySettings
);

export default router;
