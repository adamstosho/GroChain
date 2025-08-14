import request from 'supertest';
import app from '../../src/index';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, UserRole } from '../../src/models/user.model';
import { Partner, PartnerType } from '../../src/models/partner.model';
import bcrypt from 'bcryptjs';

describe('CSV Upload Integration Tests', () => {
  let partnerToken: string;
  let partnerId: string;
  let adminToken: string;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    try {
      // Start in-memory MongoDB
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
      await Partner.deleteMany({}).maxTimeMS(5000);
      
      // Create test partner
      const hashedPassword = await bcrypt.hash('password123', 12);
      const partner = await Partner.create({
        name: 'Test Extension Agency',
        type: PartnerType.AGENCY,
        contactEmail: 'test@extension.com',
        contactPhone: '+2348012345678',
        referralCode: 'TEST001',
        commissionBalance: 0
      });
      partnerId = (partner._id as mongoose.Types.ObjectId).toString();
      
      // Create partner user
      await User.create({
        name: 'Test Partner',
        email: 'partner@test.com',
        phone: '+2348012345678',
        password: hashedPassword,
        role: UserRole.PARTNER,
        status: 'active'
      });
      
      // Create admin user
      await User.create({
        name: 'Test Admin',
        email: 'admin@test.com',
        phone: '+2348023456789',
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: 'active'
      });
      
      // Login to get tokens (align with controller response fields)
      const partnerLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'partner@test.com', password: 'password123' });
      partnerToken = partnerLoginResponse.body.accessToken;
      
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
    // Clean up users after each test with timeout
    try {
      await User.deleteMany({ role: UserRole.FARMER }).maxTimeMS(5000);
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  });

  describe('POST /api/partners/upload-csv', () => {
    it('should successfully upload and process valid CSV file', async () => {
      const validCSV = 'name,email,phone,password\nJohn Doe,john@test.com,+2348011111111,password123\nJane Smith,jane@test.com,+2348022222222,password456';
      
      const response = await request(app)
        .post('/api/partners/upload-csv')
        .set('Authorization', `Bearer ${partnerToken}`)
        .field('partnerId', partnerId)
        .attach('csvFile', Buffer.from(validCSV), 'farmers.csv');

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.summary.totalRows).toBe(2);
      expect(response.body.summary.validRows).toBe(2);
      expect(response.body.summary.onboarded).toBe(2);
      expect(response.body.summary.failed).toBe(0);
      expect(response.body.summary.skipped).toBe(0);
      expect(response.body.details.onboarded).toHaveLength(2);
      expect(response.body.details.onboarded[0]).toHaveProperty('userId');
      expect(response.body.details.onboarded[0]).toHaveProperty('rowNumber');
    });

    it('should handle CSV with missing required fields', async () => {
      const invalidCSV = 'name,email,phone\nJohn Doe,john@test.com\nJane Smith,jane@test.com,+2348022222222';
      
      const response = await request(app)
        .post('/api/partners/upload-csv')
        .set('Authorization', `Bearer ${partnerToken}`)
        .field('partnerId', partnerId)
        .attach('csvFile', Buffer.from(invalidCSV), 'invalid.csv');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.validationErrors).toHaveLength(1);
      expect(response.body.validationErrors[0].row).toBe(1);
      expect(response.body.validationErrors[0].field).toBe('phone');
      expect(response.body.validationErrors[0].message).toBe('Phone number is required');
    });

    it('should handle CSV with invalid email format', async () => {
      const invalidCSV = 'name,email,phone\nJohn Doe,invalid-email,+2348011111111\nJane Smith,jane@test.com,+2348022222222';
      
      const response = await request(app)
        .post('/api/partners/upload-csv')
        .set('Authorization', `Bearer ${partnerToken}`)
        .field('partnerId', partnerId)
        .attach('csvFile', Buffer.from(invalidCSV), 'invalid-email.csv');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.validationErrors).toHaveLength(1);
      expect(response.body.validationErrors[0].field).toBe('email');
      expect(response.body.validationErrors[0].message).toBe('Invalid email format');
    });

    it('should handle CSV with invalid phone format', async () => {
      const invalidCSV = 'name,email,phone\nJohn Doe,john@test.com,12345\nJane Smith,jane@test.com,+2348022222222';
      
      const response = await request(app)
        .post('/api/partners/upload-csv')
        .set('Authorization', `Bearer ${partnerToken}`)
        .field('partnerId', partnerId)
        .attach('csvFile', Buffer.from(invalidCSV), 'invalid-phone.csv');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.validationErrors).toHaveLength(1);
      expect(response.body.validationErrors[0].field).toBe('phone');
      expect(response.body.validationErrors[0].message).toBe('Invalid Nigerian phone number format');
    });

    it('should handle CSV with weak passwords', async () => {
      const invalidCSV = 'name,email,phone,password\nJohn Doe,john@test.com,+2348011111111,123\nJane Smith,jane@test.com,+2348022222222,password456';
      
      const response = await request(app)
        .post('/api/partners/upload-csv')
        .set('Authorization', `Bearer ${partnerToken}`)
        .field('partnerId', partnerId)
        .attach('csvFile', Buffer.from(invalidCSV), 'weak-password.csv');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.validationErrors).toHaveLength(1);
      expect(response.body.validationErrors[0].field).toBe('password');
      expect(response.body.validationErrors[0].message).toBe('Password must be at least 6 characters');
    });

    it('should handle duplicate users gracefully', async () => {
      // First upload
      const csv1 = 'name,email,phone\nJohn Doe,john@test.com,+2348011111111';
      await request(app)
        .post('/api/partners/upload-csv')
        .set('Authorization', `Bearer ${partnerToken}`)
        .field('partnerId', partnerId)
        .attach('csvFile', Buffer.from(csv1), 'first.csv');

      // Second upload with duplicate
      const csv2 = 'name,email,phone\nJohn Doe,john@test.com,+2348011111111\nJane Smith,jane@test.com,+2348022222222';
      const response = await request(app)
        .post('/api/partners/upload-csv')
        .set('Authorization', `Bearer ${partnerToken}`)
        .field('partnerId', partnerId)
        .attach('csvFile', Buffer.from(csv2), 'duplicate.csv');

      expect(response.status).toBe(207); // Partial success
      expect(response.body.status).toBe('partial_success');
      expect(response.body.summary.onboarded).toBe(1);
      expect(response.body.summary.skipped).toBe(1);
      expect(response.body.details.skipped[0].reason).toBe('Email or phone already registered.');
    });

    it('should handle missing partner ID', async () => {
      const validCSV = 'name,email,phone\nJohn Doe,john@test.com,+2348011111111';
      
      const response = await request(app)
        .post('/api/partners/upload-csv')
        .set('Authorization', `Bearer ${partnerToken}`)
        .attach('csvFile', Buffer.from(validCSV), 'no-partner.csv');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('MISSING_PARTNER_ID');
      expect(response.body.message).toBe('Partner ID is required.');
    });

    it('should handle invalid partner ID', async () => {
      const validCSV = 'name,email,phone\nJohn Doe,john@test.com,+2348011111111';
      const invalidPartnerId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .post('/api/partners/upload-csv')
        .set('Authorization', `Bearer ${partnerToken}`)
        .field('partnerId', invalidPartnerId)
        .attach('csvFile', Buffer.from(validCSV), 'invalid-partner.csv');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('PARTNER_NOT_FOUND');
      expect(response.body.message).toBe('Partner not found.');
    });

    it('should handle missing file', async () => {
      const response = await request(app)
        .post('/api/partners/upload-csv')
        .set('Authorization', `Bearer ${partnerToken}`)
        .field('partnerId', partnerId);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('MISSING_FILE');
      expect(response.body.message).toBe('No CSV file uploaded.');
    });

    it('should handle empty CSV file', async () => {
      const emptyCSV = 'name,email,phone\n';
      
      const response = await request(app)
        .post('/api/partners/upload-csv')
        .set('Authorization', `Bearer ${partnerToken}`)
        .field('partnerId', partnerId)
        .attach('csvFile', Buffer.from(emptyCSV), 'empty.csv');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('NO_VALID_DATA');
      expect(response.body.message).toBe('No valid farmer data found in CSV.');
    });

    it('should generate secure default passwords when not provided', async () => {
      const csvWithoutPasswords = 'name,email,phone\nJohn Doe,john@test.com,+2348011111111\nJane Smith,jane@test.com,+2348022222222';
      
      const response = await request(app)
        .post('/api/partners/upload-csv')
        .set('Authorization', `Bearer ${partnerToken}`)
        .field('partnerId', partnerId)
        .attach('csvFile', Buffer.from(csvWithoutPasswords), 'no-passwords.csv');

      expect(response.status).toBe(201);
      expect(response.body.summary.onboarded).toBe(2);
      
      // Verify users were created with generated passwords
      const users = await User.find({ email: { $in: ['john@test.com', 'jane@test.com'] } });
      expect(users).toHaveLength(2);
      
      // Check that passwords are secure (at least 12 characters)
      users.forEach(user => {
        expect(user.password.length).toBeGreaterThanOrEqual(12);
        expect(user.password).toMatch(/^GroChain/);
      });
    });

    it('should update partner onboarded farmers list', async () => {
      const csv = 'name,email,phone\nJohn Doe,john@test.com,+2348011111111';
      
      const response = await request(app)
        .post('/api/partners/upload-csv')
        .set('Authorization', `Bearer ${partnerToken}`)
        .field('partnerId', partnerId)
        .attach('csvFile', Buffer.from(csv), 'update-partner.csv');

      expect(response.status).toBe(201);
      
      // Verify partner was updated
      const updatedPartner = await Partner.findById(partnerId);
      expect(updatedPartner).toBeTruthy();
      expect(updatedPartner!.onboardedFarmers).toHaveLength(1);
      
      // Verify referral was created
      const user = await User.findOne({ email: 'john@test.com' });
      expect(user).toBeTruthy();
      
      // Check referral record exists
      const Referral = require('../../src/models/referral.model').Referral;
      const referral = await Referral.findOne({ farmer: user!._id, partner: partnerId });
      expect(referral).toBeTruthy();
      expect(referral.status).toBe('pending');
      expect(referral.commission).toBe(0);
    });

    it('should require partner or admin role', async () => {
      // Create a regular user
      const hashedPassword = await bcrypt.hash('password123', 12);
      const regularUser = await User.create({
        name: 'Regular User',
        email: 'regular@test.com',
        phone: '+2348033333333',
        password: hashedPassword,
        role: UserRole.FARMER,
        status: 'active'
      });

      // Login as regular user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'regular@test.com',
          password: 'password123'
        });
      const regularToken = loginResponse.body.accessToken;

      const csv = 'name,email,phone\nJohn Doe,john@test.com,+2348011111111';
      
      const response = await request(app)
        .post('/api/partners/upload-csv')
        .set('Authorization', `Bearer ${regularToken}`)
        .field('partnerId', partnerId)
        .attach('csvFile', Buffer.from(csv), 'unauthorized.csv');

      expect(response.status).toBe(403);
    });
  });
});
