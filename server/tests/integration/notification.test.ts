import request from 'supertest';
import app from '../../src/index';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, UserRole } from '../../src/models/user.model';
import bcrypt from 'bcryptjs';

describe('Notification Service Integration Tests', () => {
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    try {
      // Connect to in-memory MongoDB
      mongoServer = await MongoMemoryServer.create();
      const mongoURI = mongoServer.getUri();
      
      // Connect with proper options
      await mongoose.connect(mongoURI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      // Wait for connection to be ready
      await mongoose.connection.asPromise();
      
      // Clear test data
      await User.deleteMany({}).maxTimeMS(5000);
      
      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 12);
      const user = await User.create({
        name: 'Test User',
        email: 'user@test.com',
        phone: '+2348012345678',
        password: hashedPassword,
        role: UserRole.FARMER,
        status: 'active',
        notificationPreferences: {
          sms: true,
          email: true,
          ussd: false,
          push: false,
          marketing: true,
          transaction: true,
          harvest: true,
          marketplace: true
        }
      });
      userId = (user._id as mongoose.Types.ObjectId).toString();
      
      // Create admin user
      await User.create({
        name: 'Test Admin',
        email: 'admin@test.com',
        phone: '+2348023456789',
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: 'active'
      });
      
      // Login to get tokens (use accessToken from controller response)
      const userLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@test.com', password: 'password123' });
      userToken = userLoginResponse.body.accessToken;
      
      const adminLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' });
      adminToken = adminLoginResponse.body.accessToken;
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  }, 120000); // Increased timeout

  afterAll(async () => {
    try {
      // Properly close MongoDB connection
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
      if (mongoServer) {
        await mongoServer.stop();
      }
    } catch (error) {
      console.error('Test teardown failed:', error);
    }
  }, 30000);

  afterEach(async () => {
    // Clean up after each test with timeout
    try {
      await User.updateMany({}, { $unset: { pushToken: 1 } }).maxTimeMS(5000);
      // Reset notification preferences to defaults to avoid cross-test interference
      await User.updateMany({}, {
        $set: {
          'notificationPreferences.sms': true,
          'notificationPreferences.email': true,
          'notificationPreferences.ussd': false,
          'notificationPreferences.push': false,
          'notificationPreferences.marketing': true,
          'notificationPreferences.transaction': true,
          'notificationPreferences.harvest': true,
          'notificationPreferences.marketplace': true
        }
      }).maxTimeMS(5000);
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  });

  describe('GET /api/notifications/preferences', () => {
    it('should get user notification preferences', async () => {
      const response = await request(app)
        .get('/api/notifications/preferences')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('sms');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('ussd');
      expect(response.body.data).toHaveProperty('push');
      expect(response.body.data.sms).toBe(true);
      expect(response.body.data.email).toBe(true);
      expect(response.body.data.ussd).toBe(false);
      expect(response.body.data.push).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/notifications/preferences');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/notifications/preferences', () => {
    it('should update user notification preferences', async () => {
      const newPreferences = {
        sms: false,
        email: true,
        ussd: true,
        push: true,
        marketing: false,
        transaction: true,
        harvest: false,
        marketplace: true
      };

      const response = await request(app)
        .put('/api/notifications/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newPreferences);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Notification preferences updated successfully');
      expect(response.body.data).toEqual(newPreferences);
    });

    it('should update partial preferences', async () => {
      const partialPreferences = {
        sms: false,
        push: true
      };

      const response = await request(app)
        .put('/api/notifications/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send(partialPreferences);

      expect(response.status).toBe(200);
      expect(response.body.data.sms).toBe(false);
      expect(response.body.data.push).toBe(true);
      expect(response.body.data.email).toBe(true); // Should remain unchanged
    });

    it('should require preferences object', async () => {
      const response = await request(app)
        .put('/api/notifications/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Preferences object is required');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/notifications/preferences')
        .send({ sms: false });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/notifications/push-token', () => {
    it('should update user push token', async () => {
      const pushToken = 'test-push-token-123';

      const response = await request(app)
        .put('/api/notifications/push-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ pushToken });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Push token updated successfully');
    });

    it('should require push token', async () => {
      const response = await request(app)
        .put('/api/notifications/push-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Push token is required');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/notifications/push-token')
        .send({ pushToken: 'test' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/notifications/send', () => {
    it('should send SMS notification to user', async () => {
      const notificationData = {
        userId: userId,
        type: 'sms',
        message: 'Test SMS message',
        title: 'Test SMS'
      };

      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Notification sent successfully');
    });

    it('should send email notification to user', async () => {
      const notificationData = {
        userId: userId,
        type: 'email',
        message: 'Test email message',
        title: 'Test Email'
      };

      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Notification sent successfully');
    });

    it('should send USSD notification to user', async () => {
      const notificationData = {
        userId: userId,
        type: 'ussd',
        message: 'Test USSD message',
        title: 'Test USSD'
      };

      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData);

      // USSD notifications are disabled for this user, so expect 400
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.error).toBe('ussd notifications are disabled for this user');
    });

    it('should send push notification to user', async () => {
      // First update user's push token
      await request(app)
        .put('/api/notifications/push-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ pushToken: 'test-push-token' });

      const notificationData = {
        userId: userId,
        type: 'push',
        message: 'Test push message',
        title: 'Test Push'
      };

      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Notification sent successfully');
    });

    it('should require admin or partner role', async () => {
      const notificationData = {
        userId: userId,
        type: 'sms',
        message: 'Test message'
      };

      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send(notificationData);

      expect(response.status).toBe(403);
    });

    it('should require required fields', async () => {
      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('userId, type, and message are required');
    });
  });

  describe('POST /api/notifications/send-bulk', () => {
    it('should send bulk notifications to multiple users', async () => {
      // Create additional test users
      const hashedPassword = await bcrypt.hash('password123', 12);
      const user2 = await User.create({
        name: 'Test User 2',
        email: 'user2@test.com',
        phone: '+2348034567890',
        password: hashedPassword,
        role: UserRole.FARMER,
        status: 'active'
      });

      const notificationData = {
        userIds: [userId, (user2._id as mongoose.Types.ObjectId).toString()],
        type: 'sms',
        message: 'Bulk test message',
        title: 'Bulk Test'
      };

      const response = await request(app)
        .post('/api/notifications/send-bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.summary.total).toBe(2);
      expect(response.body.summary.successful).toBeGreaterThan(0);
    });

    it('should require admin role', async () => {
      const notificationData = {
        userIds: [userId],
        type: 'sms',
        message: 'Test message'
      };

      const response = await request(app)
        .post('/api/notifications/send-bulk')
        .set('Authorization', `Bearer ${userToken}`)
        .send(notificationData);

      expect(response.status).toBe(403);
    });

    it('should require required fields', async () => {
      const response = await request(app)
        .post('/api/notifications/send-bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('userIds array, type, and message are required');
    });
  });

  describe('POST /api/notifications/transaction', () => {
    it('should send transaction notification', async () => {
      const transactionData = {
        userId: userId,
        transactionType: 'payment',
        amount: 50000,
        currency: 'NGN',
        reference: 'TXN123'
      };

      const response = await request(app)
        .post('/api/notifications/transaction')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactionData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Transaction notification sent successfully');
    });

    it('should require required fields', async () => {
      const response = await request(app)
        .post('/api/notifications/transaction')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('userId, transactionType, and amount are required');
    });
  });

  describe('POST /api/notifications/harvest', () => {
    it('should send harvest notification', async () => {
      const harvestData = {
        userId: userId,
        cropType: 'Cassava',
        quantity: 500,
        batchId: 'BATCH123'
      };

      const response = await request(app)
        .post('/api/notifications/harvest')
        .set('Authorization', `Bearer ${userToken}`)
        .send(harvestData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Harvest notification sent successfully');
    });

    it('should require required fields', async () => {
      const response = await request(app)
        .post('/api/notifications/harvest')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('userId, cropType, quantity, and batchId are required');
    });
  });

  describe('POST /api/notifications/marketplace', () => {
    it('should send marketplace notification', async () => {
      const marketplaceData = {
        userId: userId,
        action: 'listing_created',
        details: { product: 'Cassava', price: 15000 }
      };

      const response = await request(app)
        .post('/api/notifications/marketplace')
        .set('Authorization', `Bearer ${userToken}`)
        .send(marketplaceData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Marketplace notification sent successfully');
    });

    it('should require required fields', async () => {
      const response = await request(app)
        .post('/api/notifications/marketplace')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('userId, action, and details are required');
    });
  });

  describe('Notification Preferences Behavior', () => {
    it('should respect user notification preferences', async () => {
      // Update user to disable SMS notifications
      await request(app)
        .put('/api/notifications/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sms: false });

      const notificationData = {
        userId: userId,
        type: 'sms',
        message: 'Test message'
      };

      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.error).toBe('sms notifications are disabled for this user');
    });

    it('should respect category preferences', async () => {
      // Update user to disable marketing notifications
      await request(app)
        .put('/api/notifications/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ marketing: false });

      const notificationData = {
        userId: userId,
        type: 'sms',
        message: 'Marketing message',
        category: 'marketing'
      };

      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.error).toBe('marketing notifications are disabled for this user');
    });
  });
});
