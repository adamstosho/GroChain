import Joi from 'joi';

export const partnerSettingsValidation = {
  // Profile validation
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    partner: Joi.object({
      organizationName: Joi.string().min(2).max(100),
      organizationType: Joi.string().valid('cooperative', 'company', 'ngo', 'government', 'individual'),
      registrationNumber: Joi.string().min(5).max(50),
      address: Joi.object({
        street: Joi.string().min(5).max(200),
        city: Joi.string().min(2).max(50),
        state: Joi.string().min(2).max(50),
        postalCode: Joi.string().min(3).max(10)
      }),
      contactPerson: Joi.string().min(2).max(100),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
      website: Joi.string().uri().allow('')
    })
  }),

  // Preferences validation
  updatePreferences: Joi.object({
    theme: Joi.string().valid('light', 'dark', 'system'),
    language: Joi.string().valid('en', 'yo', 'ig', 'ha', 'fr'),
    notifications: Joi.object({
      email: Joi.boolean(),
      sms: Joi.boolean(),
      push: Joi.boolean(),
      harvest: Joi.boolean(),
      marketplace: Joi.boolean(),
      transaction: Joi.boolean(),
      security: Joi.boolean()
    }),
    privacy: Joi.object({
      profileVisibility: Joi.string().valid('public', 'private', 'friends'),
      dataSharing: Joi.boolean(),
      analytics: Joi.boolean(),
      locationSharing: Joi.boolean()
    })
  }),

  // Settings validation
  updateSettings: Joi.object({
    organization: Joi.object({
      services: Joi.array().items(Joi.string().valid(
        'input_supply',
        'training',
        'financing',
        'market_access',
        'quality_assurance',
        'logistics',
        'insurance',
        'weather_forecasting'
      )),
      regions: Joi.array().items(Joi.string()),
      commissionRate: Joi.number().min(0).max(100),
      autoOnboarding: Joi.boolean(),
      qualityStandards: Joi.array().items(Joi.string()),
      trainingPrograms: Joi.array().items(Joi.string())
    }),
    notifications: Joi.object({
      newFarmers: Joi.boolean(),
      commissionUpdates: Joi.boolean(),
      qualityAlerts: Joi.boolean(),
      trainingReminders: Joi.boolean(),
      marketUpdates: Joi.boolean()
    }),
    security: Joi.object({
      twoFactorEnabled: Joi.boolean(),
      loginNotifications: Joi.boolean(),
      sessionTimeout: Joi.number().min(15).max(480), // minutes
      passwordExpiry: Joi.number().min(30).max(365) // days
    }),
    display: Joi.object({
      compactMode: Joi.boolean(),
      showTutorials: Joi.boolean(),
      autoSave: Joi.boolean(),
      defaultCurrency: Joi.string().valid('NGN', 'USD', 'EUR', 'GBP')
    })
  })
};
