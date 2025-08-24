import Joi from 'joi';

export const userValidation = {
  // Get users validation
  getUsers: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    role: Joi.string().valid('farmer', 'buyer', 'partner', 'admin', 'manager'),
    status: Joi.string().valid('active', 'inactive', 'pending', 'suspended'),
    region: Joi.string(),
    search: Joi.string().min(1)
  }),

  // Get single user validation
  getUser: Joi.object({
    userId: Joi.string().required()
  }),

  // Create user validation
  createUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('farmer', 'buyer', 'partner', 'admin', 'manager').required(),
    profile: Joi.object({
      fullName: Joi.string().min(2).required(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
      location: Joi.string(),
      gender: Joi.string().valid('male', 'female', 'other'),
      age: Joi.number().min(18).max(120),
      education: Joi.string().valid('none', 'primary', 'secondary', 'tertiary')
    }),
    partnerId: Joi.string().when('role', {
      is: 'farmer',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }),

  // Update user validation
  updateUser: Joi.object({
    userId: Joi.string().required(),
    profile: Joi.object({
      fullName: Joi.string().min(2),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
      location: Joi.string(),
      gender: Joi.string().valid('male', 'female', 'other'),
      age: Joi.number().min(18).max(120),
      education: Joi.string().valid('none', 'primary', 'secondary', 'tertiary')
    }),
    isActive: Joi.boolean(),
    isVerified: Joi.boolean(),
    role: Joi.string().valid('farmer', 'buyer', 'partner', 'admin', 'manager')
  }),

  // Delete user validation
  deleteUser: Joi.object({
    userId: Joi.string().required()
  }),

  // Bulk operations validation
  bulkCreateUsers: Joi.object({
    users: Joi.array().items(Joi.object({
      email: Joi.string().email().required(),
      role: Joi.string().valid('farmer', 'buyer', 'partner', 'admin', 'manager').required(),
      profile: Joi.object({
        fullName: Joi.string().min(2).required(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
        location: Joi.string(),
        gender: Joi.string().valid('male', 'female', 'other'),
        age: Joi.number().min(18).max(120),
        education: Joi.string().valid('none', 'primary', 'secondary', 'tertiary')
      }),
      partnerId: Joi.string().when('role', {
        is: 'farmer',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    })).min(1).max(100).required(),
    sendInvites: Joi.boolean().default(true)
  }),

  bulkUpdateUsers: Joi.object({
    userIds: Joi.array().items(Joi.string()).min(1).max(100).required(),
    updates: Joi.object({
      isActive: Joi.boolean(),
      isVerified: Joi.boolean(),
      role: Joi.string().valid('farmer', 'buyer', 'partner', 'admin', 'manager'),
      status: Joi.string().valid('active', 'inactive', 'pending', 'suspended')
    }).required()
  }),

  bulkDeleteUsers: Joi.object({
    userIds: Joi.array().items(Joi.string()).min(1).max(100).required(),
    force: Joi.boolean().default(false)
  }),

  // User search validation
  searchUsers: Joi.object({
    query: Joi.string().min(1).required(),
    role: Joi.string().valid('farmer', 'buyer', 'partner', 'admin', 'manager'),
    status: Joi.string().valid('active', 'inactive', 'pending', 'suspended'),
    region: Joi.string(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10)
  }),

  // User statistics validation
  getUserStats: Joi.object({
    userId: Joi.string().required(),
    period: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly').default('monthly'),
    startDate: Joi.date(),
    endDate: Joi.date()
  }),

  // User activity validation
  getUserActivity: Joi.object({
    userId: Joi.string().required(),
    type: Joi.string().valid('all', 'harvest', 'order', 'payment', 'verification'),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20)
  }),

  // User verification validation
  verifyUser: Joi.object({
    userId: Joi.string().required(),
    verificationType: Joi.string().valid('email', 'phone', 'identity', 'location').required(),
    verificationData: Joi.object().required()
  }),

  // User suspension validation
  suspendUser: Joi.object({
    userId: Joi.string().required(),
    reason: Joi.string().min(10).required(),
    duration: Joi.number().min(1).max(365), // days
    permanent: Joi.boolean().default(false)
  }),

  // User reactivation validation
  reactivateUser: Joi.object({
    userId: Joi.string().required(),
    reason: Joi.string().min(10).required()
  }),

  // User role change validation
  changeUserRole: Joi.object({
    userId: Joi.string().required(),
    newRole: Joi.string().valid('farmer', 'buyer', 'partner', 'admin', 'manager').required(),
    reason: Joi.string().min(10).required(),
    effectiveDate: Joi.date().min('now')
  }),

  // User export validation
  exportUsers: Joi.object({
    format: Joi.string().valid('csv', 'excel', 'json').default('csv'),
    filters: Joi.object({
      role: Joi.string().valid('farmer', 'buyer', 'partner', 'admin', 'manager'),
      status: Joi.string().valid('active', 'inactive', 'pending', 'suspended'),
      region: Joi.string(),
      startDate: Joi.date(),
      endDate: Joi.date()
    })
  }),

  // Profile management validation
  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    location: Joi.object({
      state: Joi.string().min(2).max(50),
      lga: Joi.string().min(2).max(50),
      address: Joi.string().min(5).max(200)
    }),
    gender: Joi.string().valid('male', 'female', 'other'),
    age: Joi.number().min(18).max(120),
    education: Joi.string().valid('none', 'primary', 'secondary', 'tertiary'),
    bio: Joi.string().max(500),
    avatar: Joi.string().uri()
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
    }),
    performance: Joi.object({
      cacheEnabled: Joi.boolean(),
      offlineMode: Joi.boolean(),
      syncFrequency: Joi.string().valid('realtime', '5min', '15min', '1hour')
    })
  }),

  // Password management validation
  changePassword: Joi.object({
    currentPassword: Joi.string().min(8).required(),
    newPassword: Joi.string().min(8).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().required(),
    resetToken: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  })
};
