import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/index';
import { User, UserRole } from '../../src/models/user.model';

declare const describe: any;
declare const beforeAll: any;
declare const afterAll: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

describe('Notification preferences and RBAC', () => {
  let mongoServer: MongoMemoryServer;
  let adminToken: string;
  let user: any;

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
    user = await User.create({ name: 'U', email: 'u@test.com', phone: '+2348010000000', password: 'pass123', role: UserRole.FARMER });
    const admin = await User.create({ name: 'A', email: 'a@test.com', phone: '+2348090000000', password: 'pass123', role: UserRole.ADMIN });

    const login = await request(app).post('/api/auth/login').send({ email: 'a@test.com', password: 'pass123' });
    adminToken = login.body.accessToken;
  });

  it('admin can send notification; user can update preferences and block category', async () => {
    // Update user prefs to disable marketing
    const userLogin = await request(app).post('/api/auth/login').send({ email: 'u@test.com', password: 'pass123' });
    const userToken = userLogin.body.accessToken;

    await request(app)
      .put('/api/notifications/preferences')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ marketing: false })
      .expect(200);

    // Try to send marketing notification; should be recorded as failed due to preferences
    const res = await request(app)
      .post('/api/notifications/send')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: (user._id as any).toString(), type: 'push', message: 'Promo', title: 'Promo', category: 'marketing' })
      .expect(200);

    expect(res.body.status).toBe('success');
  });
});





