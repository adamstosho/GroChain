import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { User } from '../../src/models/user.model';
import { Transaction } from '../../src/models/transaction.model';
import { Harvest } from '../../src/models/harvest.model';
import { Product } from '../../src/models/product.model';
import { Order } from '../../src/models/order.model';
import { CreditScore } from '../../src/models/creditScore.model';
import { LoanReferral } from '../../src/models/loanReferral.model';
import { Partner } from '../../src/models/partner.model';
import { WeatherData } from '../../src/models/weather.model';

let mongoServer: MongoMemoryServer;
let adminToken: string;
let partnerToken: string;
let testPartnerId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test admin user
  const adminUser = new User({
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+2341234567890',
    password: 'password123',
    role: 'admin',
    isVerified: true
  });
  await adminUser.save();

  // Create test partner user
  const partnerUser = new User({
    name: 'Partner User',
    email: 'partner@example.com',
    phone: '+2341234567891',
    password: 'password123',
    role: 'partner',
    isVerified: true
  });
  await partnerUser.save();

  // Create test partner
  const testPartner = new Partner({
    name: 'Test Partner Organization',
    email: 'partner@example.com',
    farmerCount: 50,
    revenueGenerated: 1000000,
    isActive: true,
    region: 'Lagos'
  });
  await testPartner.save();
  testPartnerId = (testPartner._id as mongoose.Types.ObjectId).toString();

  // Login to get tokens
  const adminResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@example.com',
      password: 'password123'
    });
  adminToken = adminResponse.body.data.accessToken;

  const partnerResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'partner@example.com',
      password: 'password123'
    });
  partnerToken = partnerResponse.body.data.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Transaction.deleteMany({});
  await Harvest.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await CreditScore.deleteMany({});
  await LoanReferral.deleteMany({});
  await WeatherData.deleteMany({});
});

describe('Analytics API Endpoints', () => {
  describe('GET /api/analytics/dashboard', () => {
    it('should return dashboard metrics for admin', async () => {
      // Create test data
      const testUser = await User.findOne({ role: 'farmer' });
      if (!testUser) {
        const farmerUser = new User({
          name: 'Test Farmer',
          email: 'farmer@example.com',
          phone: '+2341234567892',
          password: 'password123',
          role: 'farmer',
          gender: 'male',
          age: 30,
          education: 'secondary',
          region: 'Lagos',
          isVerified: true
        });
        await farmerUser.save();
      }

      const farmerUser = await User.findOne({ role: 'farmer' });
      if (!farmerUser) throw new Error('Farmer user not found');

      const testTransaction = new Transaction({
        userId: farmerUser._id,
        amount: 50000,
        status: 'completed',
        paymentMethod: 'mobileMoney',
        region: 'Lagos'
      });
      await testTransaction.save();

      const testHarvest = new Harvest({
        farmerId: farmerUser._id,
        cropType: 'maize',
        volume: 1000,
        quality: 'premium',
        harvestDate: new Date(),
        region: 'Lagos'
      });
      await testHarvest.save();

      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          region: 'Lagos'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.farmers).toBeDefined();
      expect(response.body.data.transactions).toBeDefined();
      expect(response.body.data.harvests).toBeDefined();
    });

    it('should return dashboard metrics for partner', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${partnerToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/analytics/farmers', () => {
    it('should return farmer analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/farmers')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          region: 'Lagos'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.demographics).toBeDefined();
      expect(response.body.data.trends).toBeDefined();
    });
  });

  describe('GET /api/analytics/transactions', () => {
    it('should return transaction analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/transactions')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          region: 'Lagos'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.breakdown).toBeDefined();
      expect(response.body.data.trends).toBeDefined();
    });
  });

  describe('GET /api/analytics/harvests', () => {
    it('should return harvest analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/harvests')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          region: 'Lagos'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.breakdown).toBeDefined();
      expect(response.body.data.trends).toBeDefined();
    });
  });

  describe('GET /api/analytics/marketplace', () => {
    it('should return marketplace analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/marketplace')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          region: 'Lagos'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.topProducts).toBeDefined();
    });
  });

  describe('GET /api/analytics/fintech', () => {
    it('should return fintech analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/fintech')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          region: 'Lagos'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.creditScores).toBeDefined();
      expect(response.body.data.loans).toBeDefined();
    });
  });

  describe('GET /api/analytics/impact', () => {
    it('should return impact analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/impact')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          region: 'Lagos'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.economic).toBeDefined();
      expect(response.body.data.social).toBeDefined();
      expect(response.body.data.environmental).toBeDefined();
    });
  });

  describe('GET /api/analytics/partners', () => {
    it('should return partner analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/partners')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.topPerformers).toBeDefined();
    });

    it('should filter by partner ID', async () => {
      const response = await request(app)
        .get('/api/analytics/partners')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          partnerId: testPartnerId
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });

  describe('GET /api/analytics/weather', () => {
    it('should return weather analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/weather')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          region: 'Lagos'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.impact).toBeDefined();
    });
  });

  describe('POST /api/analytics/report', () => {
    it('should generate analytics report for admin', async () => {
      const response = await request(app)
        .post('/api/analytics/report')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          period: 'monthly',
          region: 'Lagos'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.reportId).toBeDefined();
      expect(response.body.data.period).toBe('monthly');
      expect(response.body.data.region).toBe('Lagos');
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .post('/api/analytics/report')
        .set('Authorization', `Bearer ${partnerToken}`)
        .send({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          period: 'monthly',
          region: 'Lagos'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/analytics/reports', () => {
    it('should return analytics reports', async () => {
      const response = await request(app)
        .get('/api/analytics/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          period: 'monthly'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/analytics/export', () => {
    it('should export analytics data for admin', async () => {
      const response = await request(app)
        .get('/api/analytics/export')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          period: 'monthly',
          region: 'Lagos'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.period).toBe('monthly');
      expect(response.body.data.region).toBe('Lagos');
      expect(response.body.data.generatedAt).toBeDefined();
      expect(response.body.data.metrics).toBeDefined();
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .get('/api/analytics/export')
        .set('Authorization', `Bearer ${partnerToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          period: 'monthly',
          region: 'Lagos'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Validation and Error Handling', () => {
    it('should validate date parameters', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: 'invalid-date',
          endDate: 'invalid-date'
        });

      expect(response.status).toBe(400);
    });

    it('should validate period parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          period: 'invalid-period'
        });

      expect(response.status).toBe(400);
    });

    it('should handle invalid region parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          region: 'a' // Too short
        });

      expect(response.status).toBe(400);
    });
  });
});
