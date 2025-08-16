import ussdService from '../../src/services/ussd.service';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('USSD Service', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoURI = mongoServer.getUri();
    await mongoose.connect(mongoURI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.db?.dropDatabase();
  });

  describe('processUSSDRequest', () => {
    const mockRequest = {
      sessionId: 'test_session_123',
      phoneNumber: '+2348012345678',
      serviceCode: '123',
      text: '1',
      networkCode: '23401'
    };

    it('should process initial USSD request', async () => {
      const result = await ussdService.processUSSDRequest(mockRequest);
      
      expect(result).toBeDefined();
      expect(result.sessionId).toBe(mockRequest.sessionId);
      expect(result.phoneNumber).toBe(mockRequest.phoneNumber);
      expect(result.response).toContain('Harvest Management');
      expect(result.shouldClose).toBe(false);
    });

    it('should handle menu navigation', async () => {
      // First request
      await ussdService.processUSSDRequest(mockRequest);
      
      // Navigate to harvest logging
      const harvestRequest = { ...mockRequest, text: '1*1', serviceCode: '123' };
      const result = await ussdService.processUSSDRequest(harvestRequest);
      
      expect(result.response).toContain('Log New Harvest');
      expect(result.shouldClose).toBe(false);
    });

    it('should handle invalid menu selection', async () => {
      const invalidRequest = { ...mockRequest, text: '99', serviceCode: '123' };
      const result = await ussdService.processUSSDRequest(invalidRequest);
      
      expect(result.response).toContain('Invalid selection');
      expect(result.shouldClose).toBe(false);
    });

    it('should handle empty text input', async () => {
      const emptyRequest = { ...mockRequest, text: '', serviceCode: '123' };
      const result = await ussdService.processUSSDRequest(emptyRequest);
      
      expect(result.response).toContain('Welcome to GroChain');
      expect(result.shouldClose).toBe(false);
    });
  });

  describe('USSD Menu Navigation', () => {
    it('should handle harvest logging flow', async () => {
      // Start with main menu
      const mainMenuRequest = { 
        sessionId: 'test_session_123',
        phoneNumber: '+2348012345678',
        serviceCode: '123',
        text: '1',
        networkCode: '23401'
      };
      const mainResult = await ussdService.processUSSDRequest(mainMenuRequest);
      expect(mainResult.response).toContain('Harvest Management');
      expect(mainResult.shouldClose).toBe(false);

      // Navigate to harvest logging
      const harvestRequest = { ...mainMenuRequest, text: '1*1' };
      const harvestResult = await ussdService.processUSSDRequest(harvestRequest);
      expect(harvestResult.response).toContain('Log New Harvest');
      expect(harvestResult.shouldClose).toBe(false);
    });

    it('should handle marketplace access', async () => {
      const marketplaceRequest = { 
        sessionId: 'test_session_123',
        phoneNumber: '+2348012345678',
        serviceCode: '123',
        text: '2',
        networkCode: '23401'
      };
      const result = await ussdService.processUSSDRequest(marketplaceRequest);
      expect(result.response).toContain('Marketplace');
      expect(result.shouldClose).toBe(false);
    });

    it('should handle fintech services', async () => {
      const fintechRequest = { 
        sessionId: 'test_session_123',
        phoneNumber: '+2348012345678',
        serviceCode: '123',
        text: '3',
        networkCode: '23401'
      };
      const result = await ussdService.processUSSDRequest(fintechRequest);
      expect(result.response).toContain('Fintech');
      expect(result.shouldClose).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid requests gracefully', async () => {
      const invalidRequest = {
        sessionId: 'test_session_123',
        phoneNumber: '+2348012345678',
        serviceCode: '123',
        text: 'invalid',
        networkCode: '23401'
      };

      const result = await ussdService.processUSSDRequest(invalidRequest);
      expect(result).toBeDefined();
      expect(result.response).toContain('Invalid');
      expect(result.shouldClose).toBe(false);
    });

    it('should handle service errors gracefully', async () => {
      // Test with a request that might cause an error
      const errorRequest = {
        sessionId: 'test_session_123',
        phoneNumber: '+2348012345678',
        serviceCode: '123',
        text: '999',
        networkCode: '23401'
      };

      const result = await ussdService.processUSSDRequest(errorRequest);
      expect(result).toBeDefined();
      expect(result.response).toBeDefined();
      expect(typeof result.response).toBe('string');
    });
  });
});

