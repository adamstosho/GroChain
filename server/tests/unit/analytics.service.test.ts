import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import analyticsService from '../../src/services/analytics.service';
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

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await Harvest.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await CreditScore.deleteMany({});
  await LoanReferral.deleteMany({});
  await Partner.deleteMany({});
  await WeatherData.deleteMany({});
});

describe('AnalyticsService', () => {
  describe('generateDashboardMetrics', () => {
    it('should generate comprehensive dashboard metrics', async () => {
      // Create test data
      const testUser = new User({
        name: 'Test Farmer',
        email: 'test@example.com',
        phone: '+2341234567890',
        password: 'password123',
        role: 'farmer',
        gender: 'male',
        age: 30,
        education: 'secondary',
        region: 'Lagos',
        isVerified: true
      });
      await testUser.save();

      const testTransaction = new Transaction({
        userId: testUser._id,
        amount: 50000,
        status: 'completed',
        paymentMethod: 'mobileMoney',
        region: 'Lagos',
        type: 'payment',
        reference: 'TEST_REF_001',
        description: 'Test transaction',
        paymentProvider: 'paystack'
      });
      await testTransaction.save();

      const testHarvest = new Harvest({
        farmerId: testUser._id,
        cropType: 'maize',
        volume: 1000,
        quality: 'premium',
        harvestDate: new Date(),
        region: 'Lagos'
      });
      await testHarvest.save();

      const testProduct = new Product({
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        category: 'grains',
        region: 'Lagos'
      });
      await testProduct.save();

      const testOrder = new Order({
        userId: testUser._id,
        items: [{ product: testProduct._id, quantity: 1, price: 1000 }],
        totalAmount: 1000,
        status: 'completed',
        region: 'Lagos'
      });
      await testOrder.save();

      const testCreditScore = new CreditScore({
        userId: testUser._id,
        score: 650,
        region: 'Lagos'
      });
      await testCreditScore.save();

      const testLoan = new LoanReferral({
        userId: testUser._id,
        loanAmount: 100000,
        status: 'repaid',
        region: 'Lagos'
      });
      await testLoan.save();

      const testPartner = new Partner({
        name: 'Test Partner',
        email: 'partner@example.com',
        farmerCount: 10,
        revenueGenerated: 500000,
        isActive: true,
        region: 'Lagos'
      });
      await testPartner.save();

      const testWeather = new WeatherData({
        location: { lat: 6.5244, lng: 3.3792, city: 'Lagos', state: 'Lagos', country: 'Nigeria' },
        current: {
          temperature: 28,
          humidity: 75,
          precipitation: 5
        },
        region: 'Lagos',
        timestamp: new Date()
      });
      await testWeather.save();

      const filters = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        region: 'Lagos'
      };

      const metrics = await analyticsService.generateDashboardMetrics(filters);

      expect(metrics).toBeDefined();
      expect(metrics.overview.totalFarmers).toBe(1);
      expect(metrics.overview.totalTransactions).toBe(1);
      expect(metrics.overview.totalRevenue).toBe(1000);
      expect(metrics.overview.activePartners).toBe(1);

      expect(metrics.farmers.total).toBe(1);
      expect(metrics.farmers.active).toBe(1);
      expect(metrics.farmers.verified).toBe(1);
      expect(metrics.farmers.byGender.male).toBe(1);

      expect(metrics.transactions.total).toBe(1);
      expect(metrics.transactions.volume).toBe(50000);
      expect(metrics.transactions.byStatus.completed).toBe(1);

      expect(metrics.harvests.total).toBe(1);
      expect(metrics.harvests.totalVolume).toBe(1000);
      expect(metrics.harvests.byCrop.maize).toBe(1000);

      expect(metrics.marketplace.listings).toBe(1);
      expect(metrics.marketplace.orders).toBe(1);
      expect(metrics.marketplace.revenue).toBe(1000);

      expect(metrics.fintech.creditScores.total).toBe(1);
      expect(metrics.fintech.creditScores.average).toBe(650);
      expect(metrics.fintech.loans.total).toBe(1);
      expect(metrics.fintech.loans.repaymentRate).toBe(100);

      expect(metrics.partners.total).toBe(1);
      expect(metrics.partners.active).toBe(1);
      expect(metrics.partners.farmerReferrals).toBe(10);

      expect(metrics.weather.averageTemperature).toBe(28);
      expect(metrics.weather.averageHumidity).toBe(75);
    });

    it('should handle empty data gracefully', async () => {
      const metrics = await analyticsService.generateDashboardMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.overview.totalFarmers).toBe(0);
      expect(metrics.overview.totalTransactions).toBe(0);
      expect(metrics.overview.totalRevenue).toBe(0);
      expect(metrics.overview.activePartners).toBe(0);
    });

    it('should filter by region correctly', async () => {
      // Create users in different regions
      const lagosUser = new User({
        name: 'Lagos Farmer',
        email: 'lagos@example.com',
        phone: '+2341234567890',
        password: 'password123',
        role: 'farmer',
        region: 'Lagos'
      });
      await lagosUser.save();

      const abujaUser = new User({
        name: 'Abuja Farmer',
        email: 'abuja@example.com',
        phone: '+2341234567891',
        password: 'password123',
        role: 'farmer',
        region: 'Abuja'
      });
      await abujaUser.save();

      const filters = { region: 'Lagos' };
      const metrics = await analyticsService.generateDashboardMetrics(filters);

      expect(metrics.farmers.total).toBe(1);
      expect(metrics.farmers.byRegion.Lagos).toBe(1);
      expect(metrics.farmers.byRegion.Abuja).toBeUndefined();
    });

    it('should calculate impact metrics correctly', async () => {
      const testUser = new User({
        name: 'Test Farmer',
        email: 'test@example.com',
        phone: '+2341234567890',
        password: 'password123',
        role: 'farmer',
        region: 'Lagos'
      });
      await testUser.save();

      const testTransaction = new Transaction({
        userId: testUser._id,
        amount: 100000,
        status: 'completed',
        region: 'Lagos',
        type: 'payment',
        reference: 'TEST_REF_002',
        description: 'Test transaction 2',
        paymentProvider: 'paystack'
      });
      await testTransaction.save();

      const testHarvest = new Harvest({
        farmerId: testUser._id,
        cropType: 'maize',
        volume: 2000,
        quality: 'premium',
        harvestDate: new Date(),
        region: 'Lagos'
      });
      await testHarvest.save();

      const metrics = await analyticsService.generateDashboardMetrics();

      expect(metrics.impact.incomeIncrease).toBeGreaterThan(0);
      expect(metrics.impact.productivityImprovement).toBeGreaterThan(0);
      expect(metrics.impact.foodSecurity).toBeGreaterThan(0);
      expect(metrics.impact.employmentCreated).toBeGreaterThan(0);
      expect(metrics.impact.carbonFootprintReduction).toBeGreaterThan(0);
      expect(metrics.impact.waterConservation).toBeGreaterThan(0);
    });
  });

  describe('generateAnalyticsReport', () => {
    it('should generate analytics report successfully', async () => {
      const filters = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        period: 'monthly' as const,
        region: 'Lagos'
      };

      const report = await analyticsService.generateAnalyticsReport(filters);

      expect(report).toBeDefined();
      expect(report.date).toBeInstanceOf(Date);
      expect(report.period).toBe('monthly');
      expect(report.region).toBe('Lagos');
      expect(report.metadata).toBeDefined();
      expect(report.metadata.dataSource).toBe('system');
      expect(report.metadata.version).toBe('1.0.0');
    });
  });

  describe('getAnalyticsData', () => {
    it('should retrieve analytics data with filters', async () => {
      // Create test analytics data
      const testAnalytics = new (await import('../../src/models/analytics.model')).default({
        date: new Date(),
        period: 'monthly',
        region: 'Lagos',
        metrics: {
          farmers: { total: 10, active: 8, new: 2, verified: 7 },
          transactions: { total: 50, volume: 500000, averageValue: 10000 },
          harvests: { total: 20, totalVolume: 20000, averageYield: 1000 },
          marketplace: { listings: 30, orders: 40, revenue: 400000, commission: 12000 },
          fintech: { creditScores: { total: 15, average: 600 }, loans: { total: 10, amount: 1000000 } },
          impact: { incomeIncrease: 25, productivityImprovement: 30, foodSecurity: 80 },
          partners: { total: 5, active: 4, farmerReferrals: 50, revenueGenerated: 200000 },
          weather: { averageTemperature: 28, averageHumidity: 75, rainfall: 100 }
        }
      });
      await testAnalytics.save();

      const filters = { period: 'monthly' as const, region: 'Lagos' };
      const reports = await analyticsService.getAnalyticsData(filters);

      expect(reports).toBeDefined();
      expect(reports).toHaveLength(1);
      expect(reports[0].period).toBe('monthly');
      expect(reports[0].region).toBe('Lagos');
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock a database error by disconnecting
      await mongoose.disconnect();

      await expect(analyticsService.generateDashboardMetrics()).rejects.toThrow('Failed to generate dashboard metrics');

      // Reconnect for cleanup
      await mongoose.connect(mongoServer.getUri());
    });
  });
});
