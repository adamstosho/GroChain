import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Jest globals
declare const describe: any;
declare const beforeAll: any;
declare const afterAll: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;
declare const jest: any;
import app from '../../src/index';
import { User, UserRole } from '../../src/models/user.model';
import { Order } from '../../src/models/order.model';
import { Partner } from '../../src/models/partner.model';
import { Referral } from '../../src/models/referral.model';
import { Transaction, TransactionStatus, TransactionType } from '../../src/models/transaction.model';
import { CreditScore } from '../../src/models/creditScore.model';
import { Listing } from '../../src/models/listing.model';

jest.mock('../../src/utils/paystack.util', () => ({
  initializePayment: jest.fn(async (_email: string, amount: number, reference: string, metadata: any) => ({
    status: true,
    data: { authorization_url: 'http://paystack.test/redirect', reference, amount, metadata }
  })),
  verifyPayment: jest.fn(async (reference: string) => ({
    status: true,
    data: { status: 'success', reference, metadata: { orderId: globalThis.__TEST_ORDER_ID__ } }
  }))
}));

declare global {
  // eslint-disable-next-line no-var
  var __TEST_ORDER_ID__: string;
}

describe('Payments integration', () => {
  let mongoServer: MongoMemoryServer;
  let buyer: any;
  let farmer1: any;
  let farmer2: any;
  let partner1: any;
  let partner2: any;

  beforeAll(async () => {
    process.env.PLATFORM_FEE_RATE = '0.03';
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
    buyer = await User.create({
      name: 'Buyer One',
      email: 'buyer1@example.com',
      phone: '+2348011111111',
      password: 'password123',
      role: UserRole.BUYER
    });

    // Create two farmers with different partners
    farmer1 = await User.create({ name: 'Farmer1', email: 'f1@example.com', phone: '+2348010000001', password: 'pass', role: UserRole.FARMER });
    farmer2 = await User.create({ name: 'Farmer2', email: 'f2@example.com', phone: '+2348010000002', password: 'pass', role: UserRole.FARMER });

    partner1 = await Partner.create({ name: 'Partner 1', type: 'cooperative', contactEmail: 'p1@a.com', contactPhone: '+2348000000001', referralCode: 'REF-P1' });
    partner2 = await Partner.create({ name: 'Partner 2', type: 'cooperative', contactEmail: 'p2@a.com', contactPhone: '+2348000000002', referralCode: 'REF-P2' });

    // Pending referrals for each farmer
    await Referral.create({ farmer: farmer1._id, partner: partner1._id, status: 'pending', commissionRate: 0.05 });
    await Referral.create({ farmer: farmer2._id, partner: partner2._id, status: 'pending', commissionRate: 0.05 });
  });

  it('creates pending payment, verifies, applies platform fee and per-item commissions, and is idempotent', async () => {
    // Create listings for two farmers
    const listing1 = await Listing.create({ product: 'Yam', price: 5000, quantity: 100, farmer: farmer1._id, partner: partner1._id, images: [] });
    const listing2 = await Listing.create({ product: 'Cassava', price: 3000, quantity: 100, farmer: farmer2._id, partner: partner2._id, images: [] });

    const order = await Order.create({
      buyer: buyer._id,
      items: [
        { listing: listing1._id, quantity: 2, price: listing1.price },
        { listing: listing2._id, quantity: 1, price: listing2.price },
      ],
      total: 2 * 5000 + 1 * 3000,
      status: 'pending'
    });

    global.__TEST_ORDER_ID__ = (order._id as any).toString();

    // Login buyer to get auth token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: buyer.email, password: 'password123' })
      .expect(200);
    const token = loginRes.body.accessToken;

    // Initialize payment (requires auth)
    const initRes = await request(app)
      .post('/api/payments/initialize')
      .set('Authorization', `Bearer ${token}`)
      .send({ orderId: (order._id as any).toString(), email: buyer.email })
      .expect(200);

    expect(initRes.body.status).toBe('success');
    const reference = initRes.body.payment.data.reference;

    // Verify webhook (first time)
    await request(app).post('/api/payments/verify').send({ reference }).expect(200);

    // Order updated
    const paidOrder = await Order.findById(order._id as any);
    expect(paidOrder?.status).toBe('paid');

    // Payment transaction completed
    const completedTx = await Transaction.findOne({ reference, type: TransactionType.PAYMENT });
    expect(completedTx?.status).toBe(TransactionStatus.COMPLETED);

    // Platform fee recorded
    const feeTx = await Transaction.findOne({ reference: `PLATFORM_FEE_${reference}`, type: TransactionType.PLATFORM_FEE });
    expect(feeTx).toBeTruthy();
    expect(feeTx?.amount).toBe(Math.round(order.total * 0.03));

    // Commission transactions recorded for partners
    const commissionTxs = await Transaction.find({ type: TransactionType.COMMISSION }).lean();
    expect(commissionTxs.length).toBeGreaterThanOrEqual(2);

    // Idempotent second verify
    await request(app).post('/api/payments/verify').send({ reference }).expect(200);

    // No duplicate platform fee
    const feeTxsAfter = await Transaction.find({ reference: `PLATFORM_FEE_${reference}`, type: TransactionType.PLATFORM_FEE });
    expect(feeTxsAfter.length).toBe(1);

    // Credit score updated/created
    const cs = await CreditScore.findOne({ farmer: buyer._id });
    expect(cs).toBeTruthy();
  });
});


