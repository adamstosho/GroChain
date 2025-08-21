import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout - increased for integration tests
(global as any).jest?.setTimeout?.(120000);

// Set required environment variables for testing if they don't exist
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/grochain-test';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_jwt_secret_key_at_least_32_characters_long_for_testing';
}

if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_at_least_32_characters_long_for_testing';
}

if (!process.env.OPENWEATHER_API_KEY) {
  process.env.OPENWEATHER_API_KEY = 'test_openweather_api_key_for_testing';
}

if (!process.env.AGROMONITORING_API_KEY) {
  process.env.AGROMONITORING_API_KEY = 'test_agromonitoring_api_key_for_testing';
}

if (!process.env.TWILIO_ACCOUNT_SID) {
  process.env.TWILIO_ACCOUNT_SID = 'test_twilio_account_sid_for_testing';
}

if (!process.env.TWILIO_AUTH_TOKEN) {
  process.env.TWILIO_AUTH_TOKEN = 'test_twilio_auth_token_for_testing';
}

if (!process.env.TWILIO_PHONE_NUMBER) {
  process.env.TWILIO_PHONE_NUMBER = '+1234567890';
}

if (!process.env.SENDGRID_API_KEY) {
  process.env.SENDGRID_API_KEY = 'test_sendgrid_api_key_for_testing';
}

if (!process.env.SENDGRID_FROM_EMAIL) {
  process.env.SENDGRID_FROM_EMAIL = 'test@example.com';
}

if (!process.env.AFRICASTALKING_API_KEY) {
  process.env.AFRICASTALKING_API_KEY = 'test_africastalking_api_key_for_testing';
}

if (!process.env.AFRICASTALKING_USERNAME) {
  process.env.AFRICASTALKING_USERNAME = 'test_username';
}

if (!process.env.AFRICASTALKING_SENDER_ID) {
  process.env.AFRICASTALKING_SENDER_ID = 'GROCHAIN';
}

if (!process.env.PAYSTACK_SECRET_KEY) {
  process.env.PAYSTACK_SECRET_KEY = 'test_paystack_secret_key_for_testing';
}

if (!process.env.FLUTTERWAVE_SECRET_KEY) {
  process.env.FLUTTERWAVE_SECRET_KEY = 'test_flutterwave_secret_key_for_testing';
}

if (!process.env.REDIS_URL) {
  process.env.REDIS_URL = 'redis://localhost:6379';
}

if (!process.env.ELASTICSEARCH_URL) {
  process.env.ELASTICSEARCH_URL = 'http://localhost:9200';
}

if (!process.env.SENTRY_DSN) {
  process.env.SENTRY_DSN = 'https://test@test.ingest.sentry.io/test';
}

if (!process.env.LOG_LEVEL) {
  process.env.LOG_LEVEL = 'error';
}

// Helpers for integration tests that expect these exports
export const getTestMongoUri = (): string => {
  // Prefer explicit TEST_MONGODB_URI if provided, else fall back to MONGODB_URI set above
  return process.env.TEST_MONGODB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain-test';
};

export const shouldRunIntegrationTests = (): boolean => {
  // Always run integration tests by default. Allow opt-out via env var.
  return process.env.RUN_INTEGRATION_TESTS !== 'false';
};

// Global test cleanup
(global as any).afterAll?.(async () => {
  // Wait for any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
});

