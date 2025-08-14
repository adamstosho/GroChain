import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pino from 'pino';
import pinoHttp from 'pino-http';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import partnerRoutes from './routes/partner.routes';
import referralRoutes from './routes/referral.routes';
import harvestRoutes from './routes/harvest.routes';
import shipmentRoutes from './routes/shipment.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import fintechRoutes from './routes/fintech.routes';
import analyticsRoutes from './routes/analytics.routes';
import paymentRoutes from './routes/payment.routes';
import notificationRoutes from './routes/notification.routes';
import commissionRoutes from './routes/commission.routes';
import verifyRoutes from './routes/verify.routes';
import pwaRoutes from './routes/pwa.routes';
import syncRoutes from './routes/sync.routes';
import languageRoutes from './routes/language.routes';
import aiRoutes from './routes/ai.routes';
import iotRoutes from './routes/iot.routes';
import imageRecognitionRoutes from './routes/imageRecognition.routes';
import advancedMLRoutes from './routes/advancedML.routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import { errorHandler } from './middlewares/error.middleware';
import { apiLimiter, authLimiter } from './middlewares/rateLimit.middleware';
import client from 'prom-client';
import { sanitizeRequest } from './middlewares/sanitize.middleware';

// Load environment variables
dotenv.config();

// Validate environment variables (skip during tests)
if (process.env.NODE_ENV !== 'test') {
  try {
    // Basic environment validation
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is required');
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
    }
  } catch (error) {
    console.error('Environment validation failed:', error);
    process.exit(1);
  }
}

const app = express();
const logger = pino();

// Export logger for use in other modules
export { logger };

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grochain';
    await mongoose.connect(mongoURI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error: %s', (error as Error).message);
    process.exit(1);
  }
};

// Connect to MongoDB (skip during tests; tests manage their own connection)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    referrerPolicy: { policy: 'no-referrer' },
  })
);
app.use(pinoHttp({ logger }));
app.use(sanitizeRequest);

// Serve static files
app.use('/public', express.static('public'));

// Rate limiting (disabled in test environment)
if (process.env.NODE_ENV !== 'test') {
  // Exclude payment webhook from generic limiter to avoid dropped provider callbacks
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/payments/verify')) return next();
    return apiLimiter(req, res, next);
  });
  app.use('/api/auth', authLimiter);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Prometheus metrics
client.collectDefaultMetrics();
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 200, 300, 400, 500, 1000]
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = (req as any).route ? (req as any).route.path : req.path;
    httpRequestDurationMicroseconds.labels(req.method, route, String(res.statusCode)).observe(duration);
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Auth routes
app.use('/api/auth', authRoutes);
// Partner routes
app.use('/api/partners', partnerRoutes);
// Referral routes
app.use('/api/referrals', referralRoutes);
// Harvest routes
app.use('/api/harvests', harvestRoutes);
// Shipment routes
app.use('/api/shipments', shipmentRoutes);
// Marketplace routes
app.use('/api/marketplace', marketplaceRoutes);
// Fintech routes
app.use('/api/fintech', fintechRoutes);
// Analytics routes
app.use('/api/analytics', analyticsRoutes);
// Payment routes
app.use('/api/payments', paymentRoutes);
// Notification routes
app.use('/api/notifications', notificationRoutes);
// Commission routes
app.use('/api/commissions', commissionRoutes);
// Verify routes (public QR verification)
app.use('/api/verify', verifyRoutes);
// PWA routes
app.use('/api/pwa', pwaRoutes);
// Sync routes
app.use('/api/sync', syncRoutes);
// Language routes
app.use('/api/languages', languageRoutes);
// AI routes
app.use('/api/ai', aiRoutes);

// IoT routes
app.use('/api/iot', iotRoutes);

// Image Recognition routes
app.use('/api/image-recognition', imageRecognitionRoutes);

// Advanced ML routes
app.use('/api/advanced-ml', advancedMLRoutes);

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`GroChain backend running on port ${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  mongoose.connection.close();
  process.exit(0);
});

export default app;
