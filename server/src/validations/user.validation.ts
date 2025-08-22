import Joi from 'joi';

// User CRUD Validation Schemas
export const createUserSchema = Joi.object({
  firstName: Joi.string().required().min(2).max(50),
  lastName: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  phone: Joi.string().required().min(10).max(15),
  password: Joi.string().required().min(8).max(128),
  role: Joi.string().required().valid('admin', 'manager', 'partner', 'farmer', 'buyer', 'inspector'),
  status: Joi.string().valid('active', 'inactive', 'suspended').default('active'),
  profile: Joi.object({
    dateOfBirth: Joi.date().iso().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      postalCode: Joi.string().optional()
    }).optional(),
    avatar: Joi.string().uri().optional(),
    bio: Joi.string().max(500).optional()
  }).optional(),
  preferences: Joi.object({
    language: Joi.string().default('en'),
    timezone: Joi.string().default('UTC'),
    notifications: Joi.object({
      email: Joi.boolean().default(true),
      sms: Joi.boolean().default(false),
      push: Joi.boolean().default(true)
    }).default(),
    theme: Joi.string().valid('light', 'dark', 'auto').default('auto')
  }).optional(),
  metadata: Joi.object().optional()
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  phone: Joi.string().min(10).max(15),
  role: Joi.string().valid('admin', 'manager', 'partner', 'farmer', 'buyer', 'inspector'),
  status: Joi.string().valid('active', 'inactive', 'suspended'),
  profile: Joi.object({
    dateOfBirth: Joi.date().iso(),
    gender: Joi.string().valid('male', 'female', 'other'),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      postalCode: Joi.string()
    }),
    avatar: Joi.string().uri(),
    bio: Joi.string().max(500)
  }),
  preferences: Joi.object({
    language: Joi.string(),
    timezone: Joi.string(),
    notifications: Joi.object({
      email: Joi.boolean(),
      sms: Joi.boolean(),
      push: Joi.boolean()
    }),
    theme: Joi.string().valid('light', 'dark', 'auto')
  }),
  metadata: Joi.object()
});

export const getUserSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().optional(),
  role: Joi.string().valid('admin', 'manager', 'partner', 'farmer', 'buyer', 'inspector').optional(),
  status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
  sortBy: Joi.string().valid('firstName', 'lastName', 'email', 'createdAt', 'lastLogin').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// User Profile Validation Schemas
export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().min(2).max(50),
  phone: Joi.string().min(10).max(15),
  profile: Joi.object({
    dateOfBirth: Joi.date().iso(),
    gender: Joi.string().valid('male', 'female', 'other'),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      postalCode: Joi.string()
    }),
    avatar: Joi.string().uri(),
    bio: Joi.string().max(500)
  }),
  preferences: Joi.object({
    language: Joi.string(),
    timezone: Joi.string(),
    notifications: Joi.object({
      email: Joi.boolean(),
      sms: Joi.boolean(),
      push: Joi.boolean()
    }),
    theme: Joi.string().valid('light', 'dark', 'auto')
  })
});

// User Authentication & Security Validation Schemas
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(8).max(128),
  confirmPassword: Joi.string().required().valid(Joi.ref('newPassword'))
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  token: Joi.string().required(),
  newPassword: Joi.string().required().min(8).max(128),
  confirmPassword: Joi.string().required().valid(Joi.ref('newPassword'))
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required()
});

export const forceLogoutSchema = Joi.object({
  userId: Joi.string().required(),
  reason: Joi.string().optional()
});

// User Status Management Validation Schemas
export const updateUserStatusSchema = Joi.object({
  status: Joi.string().required().valid('active', 'inactive', 'suspended'),
  reason: Joi.string().optional(),
  notes: Joi.string().optional()
});

export const bulkStatusUpdateSchema = Joi.object({
  userIds: Joi.array().items(Joi.string()).min(1).required(),
  status: Joi.string().required().valid('active', 'inactive', 'suspended'),
  reason: Joi.string().optional(),
  notes: Joi.string().optional()
});

// User Role & Permission Validation Schemas
export const updateUserRoleSchema = Joi.object({
  role: Joi.string().required().valid('admin', 'manager', 'partner', 'farmer', 'buyer', 'inspector'),
  reason: Joi.string().optional(),
  effectiveDate: Joi.date().iso().optional()
});

export const assignPermissionsSchema = Joi.object({
  permissions: Joi.array().items(Joi.string()).min(1).required(),
  reason: Joi.string().optional(),
  expiryDate: Joi.date().iso().optional()
});

export const removePermissionsSchema = Joi.object({
  permissions: Joi.array().items(Joi.string()).min(1).required(),
  reason: Joi.string().optional()
});

// User Group Management Validation Schemas
export const createUserGroupSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().optional().max(500),
  members: Joi.array().items(Joi.string()).optional(),
  permissions: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().default(true)
});

export const updateUserGroupSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().max(500),
  members: Joi.array().items(Joi.string()),
  permissions: Joi.array().items(Joi.string()),
  isActive: Joi.boolean()
});

export const addUsersToGroupSchema = Joi.object({
  userIds: Joi.array().items(Joi.string()).min(1).required()
});

export const removeUsersFromGroupSchema = Joi.object({
  userIds: Joi.array().items(Joi.string()).min(1).required()
});

// User Activity & Audit Validation Schemas
export const getUserActivitySchema = Joi.object({
  userId: Joi.string().required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  activityType: Joi.string().optional(),
  sortBy: Joi.string().valid('timestamp', 'activityType', 'ipAddress').default('timestamp'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

export const getAuditTrailSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  userId: Joi.string().optional(),
  action: Joi.string().optional(),
  resource: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  sortBy: Joi.string().valid('timestamp', 'userId', 'action', 'resource').default('timestamp'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// User Preferences & Notifications Validation Schemas
export const updatePreferencesSchema = Joi.object({
  language: Joi.string().valid('en', 'fr', 'es', 'ar', 'zh', 'hi', 'sw').optional(),
  timezone: Joi.string().optional(),
  notifications: Joi.object({
    email: Joi.boolean(),
    sms: Joi.boolean(),
    push: Joi.boolean()
  }).optional(),
  theme: Joi.string().valid('light', 'dark', 'auto').optional(),
  currency: Joi.string().optional(),
  dateFormat: Joi.string().valid('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD').optional(),
  timeFormat: Joi.string().valid('12h', '24h').optional()
});

export const updateNotificationSettingsSchema = Joi.object({
  notifications: Joi.object({
    email: Joi.boolean(),
    sms: Joi.boolean(),
    push: Joi.boolean()
  }).required()
});

// User Data Import/Export Validation Schemas
export const importUsersSchema = Joi.object({
  file: Joi.object({
    mimetype: Joi.string().valid('text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').required(),
    size: Joi.number().max(10 * 1024 * 1024).required() // 10MB max
  }).required(),
  options: Joi.object({
    updateExisting: Joi.boolean().default(false),
    skipErrors: Joi.boolean().default(false),
    validateData: Joi.boolean().default(true)
  }).optional()
});

export const exportUsersSchema = Joi.object({
  format: Joi.string().required().valid('csv', 'excel', 'json'),
  filters: Joi.object({
    role: Joi.string().valid('admin', 'manager', 'partner', 'farmer', 'buyer', 'inspector').optional(),
    status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
  }).optional(),
  fields: Joi.array().items(Joi.string()).optional(),
  includeInactive: Joi.boolean().default(false)
});

// User Search & Filter Validation Schemas
export const searchUsersSchema = Joi.object({
  query: Joi.string().required().min(2),
  filters: Joi.object({
    role: Joi.string().valid('admin', 'manager', 'partner', 'farmer', 'buyer', 'inspector').optional(),
    status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
    location: Joi.string().optional(),
    dateRange: Joi.object({
      start: Joi.date().iso().optional(),
      end: Joi.date().iso().optional()
    }).optional()
  }).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// Export all schemas
export const userValidation = {
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  getUser: getUserSchema,
  updateProfile: updateProfileSchema,
  changePassword: changePasswordSchema,
  resetPassword: resetPasswordSchema,
  forgotPassword: forgotPasswordSchema,
  verifyEmail: verifyEmailSchema,
  forceLogout: forceLogoutSchema,
  updateUserStatus: updateUserStatusSchema,
  bulkStatusUpdate: bulkStatusUpdateSchema,
  updateUserRole: updateUserRoleSchema,
  assignPermissions: assignPermissionsSchema,
  removePermissions: removePermissionsSchema,
  createUserGroup: createUserGroupSchema,
  updateUserGroup: updateUserGroupSchema,
  addUsersToGroup: addUsersToGroupSchema,
  removeUsersFromGroup: removeUsersFromGroupSchema,
  getUserActivity: getUserActivitySchema,
  getAuditTrail: getAuditTrailSchema,
  updatePreferences: updatePreferencesSchema,
  updateNotificationSettings: updateNotificationSettingsSchema,
  importUsers: importUsersSchema,
  exportUsers: exportUsersSchema,
  searchUsers: searchUsersSchema
};
