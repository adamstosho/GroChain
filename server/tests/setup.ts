import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout - increased for integration tests
jest.setTimeout(120000);

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Test database configuration
export const getTestMongoUri = () => {
  // Check if we have a test MongoDB URI (for local testing)
  if (process.env.TEST_MONGODB_URI) {
    return process.env.TEST_MONGODB_URI;
  }
  
  // Fallback to main MongoDB URI
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  
  // Default local MongoDB
  return 'mongodb://localhost:27017/grochain-test';
};

// Check if we should run integration tests
export const shouldRunIntegrationTests = () => {
  return process.env.OFFLINE !== 'true' && process.env.NODE_ENV === 'test';
};

// Global test cleanup
afterAll(async () => {
  // Wait for any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
});

