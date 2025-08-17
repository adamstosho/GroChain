import Joi from 'joi';

export const envSchema = Joi.object({
  // Node & Server
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(5000),
  BASE_URL: Joi.string().uri().default('http://localhost:5000'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),

  // Database
  MONGODB_URI: Joi.string().required(),
  TEST_MONGODB_URI: Joi.string().optional(),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // Paystack
  PAYSTACK_SECRET_KEY: Joi.string().optional(),
  PAYSTACK_PUBLIC_KEY: Joi.string().optional(),
  PAYSTACK_WEBHOOK_SECRET: Joi.string().optional(),
  PLATFORM_FEE_RATE: Joi.number().min(0).max(1).default(0.03),

  // Twilio SMS
  TWILIO_ACCOUNT_SID: Joi.string().optional(),
  TWILIO_AUTH_TOKEN: Joi.string().optional(),
  TWILIO_PHONE_NUMBER: Joi.string().optional(),

  // Africastalking (SMS & USSD)
  AFRICASTALKING_USERNAME: Joi.string().optional(),
  AFRICASTALKING_API_KEY: Joi.string().optional(),

  // Weather APIs
  OPENWEATHER_API_KEY: Joi.string().optional(),
  AGROMONITORING_API_KEY: Joi.string().optional(),

  // Email
  SENDGRID_API_KEY: Joi.string().optional(),
  FROM_EMAIL: Joi.string().email().optional(),
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().optional(),
  SMTP_SECURE: Joi.boolean().optional(),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  SMTP_FROM: Joi.string().email().optional(),

  // USSD
  USSD_GATEWAY_URL: Joi.string().uri().optional(),
  USSD_API_KEY: Joi.string().optional(),

  // Firebase Admin (Push Notifications)
  FIREBASE_PROJECT_ID: Joi.string().optional(),
  FIREBASE_PRIVATE_KEY_ID: Joi.string().optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().email().optional(),
  FIREBASE_CLIENT_ID: Joi.string().optional(),
  FIREBASE_AUTH_URI: Joi.string().uri().optional(),
  FIREBASE_TOKEN_URI: Joi.string().uri().optional(),
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL: Joi.string().uri().optional(),
  FIREBASE_CLIENT_X509_CERT_URL: Joi.string().optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: Joi.string().optional(),
  CLOUDINARY_API_KEY: Joi.string().optional(),
  CLOUDINARY_API_SECRET: Joi.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),

  // Testing
  OFFLINE: Joi.boolean().default(false),
});

export const validateEnv = () => {
  const { error, value } = envSchema.validate(process.env, { allowUnknown: true });
  if (error) {
    throw new Error(`Environment validation error: ${error.message}`);
  }
  return value;
};
