import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { farmerController } from '../controllers/farmer.controller';
import { farmerValidation } from '../validations/farmer.validation';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Farmer Profile & Settings
router.get('/profile/me',
  authorize(['farmer']),
  farmerController.getMyProfile
);

router.put('/profile/me',
  authorize(['farmer']),
  validateRequest(farmerValidation.updateProfile),
  farmerController.updateMyProfile
);

router.get('/preferences/me',
  authorize(['farmer']),
  farmerController.getMyPreferences
);

router.put('/preferences/me',
  authorize(['farmer']),
  validateRequest(farmerValidation.updatePreferences),
  farmerController.updateMyPreferences
);

router.get('/settings/me',
  authorize(['farmer']),
  farmerController.getMySettings
);

router.put('/settings/me',
  authorize(['farmer']),
  validateRequest(farmerValidation.updateSettings),
  farmerController.updateMySettings
);

export default router;
