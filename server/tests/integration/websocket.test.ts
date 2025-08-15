import request from 'supertest';
import app from '../../src/index';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { User, UserRole } from '../../src/models/user.model';

let mongoServer: MongoMemoryServer;
let userToken: string;
let userId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test user
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    phone: '+2348012345678',
    password: 'password123',
    role: UserRole.FARMER
  });
  userId = user._id.toString();

  // Login to get token
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@example.com',
      password: 'password123'
    });

  userToken = loginResponse.body.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('WebSocket Routes', () => {
  describe('GET /api/websocket/status', () => {
    it('should return WebSocket status', async () => {
      const response = await request(app)
        .get('/api/websocket/status')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('connectedClients');
      expect(response.body.data).toHaveProperty('websocketEnabled');
      expect(response.body.data.websocketEnabled).toBe(true);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/websocket/status')
        .expect(401);
    });
  });

  describe('POST /api/websocket/notify-user', () => {
    it('should send notification to user', async () => {
      const notificationData = {
        userId: userId,
        event: 'test_event',
        data: { message: 'Test notification' }
      };

      const response = await request(app)
        .post('/api/websocket/notify-user')
        .set('Authorization', `Bearer ${userToken}`)
        .send(notificationData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Real-time notification sent to user');
    });

    it('should require userId and event', async () => {
      const response = await request(app)
        .post('/api/websocket/notify-user')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/websocket/notify-partner-network', () => {
    it('should send notification to partner network', async () => {
      const notificationData = {
        partnerId: 'partner123',
        event: 'test_event',
        data: { message: 'Test partner notification' }
      };

      const response = await request(app)
        .post('/api/websocket/notify-partner-network')
        .set('Authorization', `Bearer ${userToken}`)
        .send(notificationData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Real-time notification sent to partner network');
    });

    it('should require partnerId and event', async () => {
      const response = await request(app)
        .post('/api/websocket/notify-partner-network')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });
});
