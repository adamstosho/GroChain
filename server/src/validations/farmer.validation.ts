import Joi from 'joi';

export const farmerValidation = {
  // Profile validation
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    location: Joi.object({
      state: Joi.string().min(2).max(50),
      lga: Joi.string().min(2).max(50),
      address: Joi.string().min(5).max(200)
    }),
    farmDetails: Joi.object({
      farmSize: Joi.number().min(0),
      farmSizeUnit: Joi.string().valid('acres', 'hectares', 'squareMeters'),
      primaryCrops: Joi.array().items(Joi.string()),
      irrigationType: Joi.string().valid('rainfed', 'drip', 'sprinkler', 'flood', 'none'),
      soilType: Joi.string().valid('clay', 'loamy', 'sandy', 'silt', 'mixed'),
      farmingExperience: Joi.string().valid('beginner', 'intermediate', 'experienced', 'expert'),
      education: Joi.string().valid('none', 'primary', 'secondary', 'tertiary', 'postgraduate'),
      householdSize: Joi.number().min(1).max(20),
      annualIncome: Joi.number().min(0)
    })
  }),

  // Preferences validation
  updatePreferences: Joi.object({
    theme: Joi.string().valid('light', 'dark', 'system'),
    language: Joi.string().valid('en', 'yo', 'ig', 'ha', 'fr'),
    notifications: Joi.object({
      sms: Joi.boolean(),
      email: Joi.boolean(),
      push: Joi.boolean(),
      harvest: Joi.boolean(),
      marketplace: Joi.boolean(),
      weather: Joi.boolean(),
      training: Joi.boolean(),
      financial: Joi.boolean()
    }),
    privacy: Joi.object({
      profileVisibility: Joi.string().valid('public', 'private', 'friends'),
      dataSharing: Joi.boolean(),
      locationSharing: Joi.boolean(),
      financialSharing: Joi.boolean()
    })
  }),

  // Settings validation
  updateSettings: Joi.object({
    farming: Joi.object({
      defaultCrop: Joi.string(),
      harvestReminders: Joi.boolean(),
      weatherAlerts: Joi.boolean(),
      pestAlerts: Joi.boolean(),
      marketPriceAlerts: Joi.boolean()
    }),
    financial: Joi.object({
      autoSave: Joi.boolean(),
      savingsGoal: Joi.number().min(0),
      investmentPreferences: Joi.array().items(Joi.string()),
      riskTolerance: Joi.string().valid('low', 'medium', 'high')
    }),
    learning: Joi.object({
      showTutorials: Joi.boolean(),
      trainingReminders: Joi.boolean(),
      preferredTopics: Joi.array().items(Joi.string()),
      learningStyle: Joi.string().valid('visual', 'audio', 'text', 'hands-on')
    })
  })
};
