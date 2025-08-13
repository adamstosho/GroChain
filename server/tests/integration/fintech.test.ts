import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/index';
import { User, UserRole } from '../../src/models/user.model';
import { CreditScore } from '../../src/models/creditScore.model';

declare const describe: any;
declare const beforeAll: any;
declare const afterAll: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

describe('Fintech RBAC/ownership', () => {
  let mongoServer: MongoMemoryServer;
  let farmer: any;
  let partner: any;
  let farmerToken: string;
  let partnerToken: string;

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
    farmer = await User.create({ name: 'F1', email: 'f1@test.com', phone: '+2348010000001', password: 'pass123', role: UserRole.FARMER });
    partner = await User.create({ name: 'P1', email: 'p1@test.com', phone: '+2348090000001', password: 'pass123', role: UserRole.PARTNER });
    await CreditScore.create({ farmer: farmer._id, score: 42, history: [] });

    const farmerLogin = await request(app).post('/api/auth/login').send({ email: 'f1@test.com', password: 'pass123' });
    farmerToken = farmerLogin.body.accessToken;

    const partnerLogin = await request(app).post('/api/auth/login').send({ email: 'p1@test.com', password: 'pass123' });
    partnerToken = partnerLogin.body.accessToken;
  });

  it('allows farmer to view only their own credit score', async () => {
    // Own score OK
    await request(app)
      .get(`/api/fintech/credit-score/${(farmer._id as any).toString()}`)
      .set('Authorization', `Bearer ${farmerToken}`)
      .expect(200);

    // Another id forbidden
    const otherFarmer = await User.create({ name: 'F2', email: 'f2@test.com', phone: '+2348010000002', password: 'pass123', role: UserRole.FARMER });
    await request(app)
      .get(`/api/fintech/credit-score/${(otherFarmer._id as any).toString()}`)
      .set('Authorization', `Bearer ${farmerToken}`)
      .expect(403);
  });

  it('allows partner to view a farmer credit score and create loan referral', async () => {
    await request(app)
      .get(`/api/fintech/credit-score/${(farmer._id as any).toString()}`)
      .set('Authorization', `Bearer ${partnerToken}`)
      .expect(200);

    await request(app)
      .post('/api/fintech/loan-referrals')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ farmer: (farmer._id as any).toString(), amount: 50000, partner: (partner._id as any).toString() })
      .expect(201);
  });
});



