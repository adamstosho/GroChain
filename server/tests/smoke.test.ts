import request from 'supertest';
import app from '../src/index';
import { errorHandler } from '../src/middlewares/error.middleware';

describe('Smoke Tests', () => {
  it('should have error handler middleware', () => {
    expect(errorHandler).toBeDefined();
    expect(typeof errorHandler).toBe('function');
  });

  it('should have app instance', () => {
    expect(app).toBeDefined();
    expect(typeof app).toBe('function');
  });

  it('should respond to health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
  });

  it('should have proper middleware setup', () => {
    // Check if app has basic Express properties
    expect(app).toHaveProperty('use');
    expect(app).toHaveProperty('get');
    expect(app).toHaveProperty('post');
  });
});
