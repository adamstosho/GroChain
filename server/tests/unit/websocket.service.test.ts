import { WebSocketService } from '../../src/services/websocket.service';
import { createServer } from 'http';

describe('WebSocketService', () => {
  let webSocketService: WebSocketService;
  let server: any;

  beforeEach(() => {
    webSocketService = new WebSocketService();
    server = createServer();
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
  });

  describe('initialize', () => {
    it('should initialize WebSocket service', () => {
      expect(() => webSocketService.initialize(server)).not.toThrow();
    });
  });

  describe('sendToUser', () => {
    it('should not throw when io is not initialized', () => {
      expect(() => webSocketService.sendToUser('userId', 'event', {})).not.toThrow();
    });
  });

  describe('sendToPartnerNetwork', () => {
    it('should not throw when io is not initialized', () => {
      expect(() => webSocketService.sendToPartnerNetwork('partnerId', 'event', {})).not.toThrow();
    });
  });

  describe('sendToFarmerNetwork', () => {
    it('should not throw when io is not initialized', () => {
      expect(() => webSocketService.sendToFarmerNetwork('farmerId', 'event', {})).not.toThrow();
    });
  });

  describe('broadcast', () => {
    it('should not throw when io is not initialized', () => {
      expect(() => webSocketService.broadcast('event', {})).not.toThrow();
    });
  });

  describe('getConnectedClientsCount', () => {
    it('should return 0 when io is not initialized', () => {
      expect(webSocketService.getConnectedClientsCount()).toBe(0);
    });
  });
});
