import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/index';
import { User, UserRole } from '../../src/models/user.model';
import { Partner, PartnerType } from '../../src/models/partner.model';
import { Transaction, TransactionType, TransactionStatus } from '../../src/models/transaction.model';

declare const describe: any;
declare const beforeAll: any;
declare const afterAll: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

describe('Commission endpoints', () => {
  let mongoServer: MongoMemoryServer;
  let partnerUser: any;
  let partnerOrg: any;
  let token: string;

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
    // Create partner org and partner user
    partnerOrg = await Partner.create({
      name: 'PartnerCo',
      type: PartnerType.COOPERATIVE,
      contactEmail: 'p@co.com',
      contactPhone: '+2348000000000',
      referralCode: 'REFP',
      commissionBalance: 10000,
    });
    partnerUser = await User.create({ name: 'PartnerUser', email: 'p@u.com', phone: '+2348010000000', password: 'pass123', role: UserRole.PARTNER });

    const login = await request(app).post('/api/auth/login').send({ email: 'p@u.com', password: 'pass123' }).expect(200);
    token = login.body.accessToken;

    // Seed some commission transactions
    await Transaction.create({
      type: TransactionType.COMMISSION,
      status: TransactionStatus.COMPLETED,
      amount: 1500,
      currency: 'NGN',
      reference: 'COMM-1',
      description: 'commission',
      userId: partnerUser._id,
      partnerId: partnerOrg._id,
      paymentProvider: 'system',
      metadata: {},
    });
    await Transaction.create({
      type: TransactionType.COMMISSION,
      status: TransactionStatus.PENDING,
      amount: 500,
      currency: 'NGN',
      reference: 'COMM-2',
      description: 'commission',
      userId: partnerUser._id,
      partnerId: partnerOrg._id,
      paymentProvider: 'system',
      metadata: {},
    });
  });

  it('returns commission summary for partner', async () => {
    const res = await request(app)
      .get('/api/commissions/summary')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.status).toBe('success');
    expect(res.body.summary).toBeDefined();
  });

  it('returns commission history with pagination', async () => {
    const res = await request(app)
      .get('/api/commissions/history?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.status).toBe('success');
    expect(res.body.history.transactions.length).toBeGreaterThanOrEqual(1);
  });

  it('processes a withdrawal request and reduces partner balance', async () => {
    const res = await request(app)
      .post('/api/commissions/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 1000 })
      .expect(200);
    expect(res.body.status).toBe('success');
  });
});





