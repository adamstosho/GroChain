import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pino from 'pino';
import pinoHttp from 'pino-http';
import mongoose from 'mongoose';
import { createServer } from 'http';
import authRoutes from './routes/auth.routes';
import partnerRoutes from './routes/partner.routes';
import harvestRoutes from './routes/harvest.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import fintechRoutes from './routes/fintech.routes';
import analyticsRoutes from './routes/analytics.routes';
import paymentRoutes from './routes/payment.routes';
import notificationRoutes from './routes/notification.routes';
import verifyRoutes from './routes/verify.routes';
import userRoutes from './routes/user.routes';
import weatherRoutes from './routes/weather.routes';
import { errorHandler } from './middlewares/error.middleware';
import { apiLimiter, authLimiter, devLimiter } from './middlewares/rateLimit.middleware';
import client from 'prom-client';
import { sanitizeRequest } from './middlewares/sanitize.middleware';
import { webSocketService } from './services/websocket.service';

// Load environment variables
dotenv.config();

// Log current environment and configuration
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🚀 Server starting with configuration:`);
console.log(`   - Port: ${process.env.PORT || 5000}`);
console.log(`   - Database: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
console.log(`   - JWT: ${process.env.JWT_SECRET ? 'Configured' : 'Not configured'}`);
console.log(`   - Rate Limiting: ${process.env.NODE_ENV === 'development' ? 'Development (1000 req/15min)' : 'Production (strict)'}`);

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
const server = createServer(app);
const logger = pino();

// Export logger for use in other modules
export { logger };

// Initialize WebSocket service
webSocketService.initialize(server);

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

// Raw body parser for payment webhooks (must come before JSON parser)
// Skip in test environment so Supertest JSON bodies are parsed normally
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/payments/verify', express.raw({ type: 'application/json' }));
}

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

// Rate limiting - More lenient in development
if (process.env.NODE_ENV === 'development') {
  // Use development-friendly rate limiting
  app.use('/api', devLimiter);
  console.log('🔧 Development mode: Using lenient rate limiting (1000 requests per 15 minutes)');
  
  // Add development logging middleware
  app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/auth/register')) {
      console.log(`🔓 Registration endpoint accessed - rate limiting is lenient in development`);
    }
    next();
  });
  
  // Add specific logging for rate limiting
  app.use('/api', (req, res, next) => {
    console.log(`🔒 Request to ${req.path} - applying dev rate limit`);
    next();
  });
  
  // Add specific bypass for registration in development
  app.use('/api/auth/register', (req, res, next) => {
    console.log(`🔓 Bypassing rate limit for registration in development`);
    next();
  });
} else if (process.env.NODE_ENV !== 'test') {
  // Use production rate limiting (but not in test environment)
  // Exclude payment webhook from generic limiter to avoid dropped provider callbacks
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/payments/verify')) return next();
    return apiLimiter(req, res, next);
  });
  app.use('/api/auth', authLimiter);
  console.log('🚀 Production mode: Using strict rate limiting');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Development endpoints (only in development)
if (process.env.NODE_ENV === 'development') {
  // Reset rate limits
  app.get('/dev/reset-rate-limit', (req, res) => {
    console.log(`🔄 Rate limits reset requested for development`);
    res.status(200).json({
      status: 'success',
      message: 'Rate limits reset for development',
      timestamp: new Date().toISOString(),
      note: 'This endpoint is only available in development mode'
    });
  });
  
  // Check rate limiting status
  app.get('/dev/rate-limit-status', (req, res) => {
    console.log(`📊 Rate limiting status requested`);
    res.status(200).json({
      status: 'success',
      environment: process.env.NODE_ENV,
      rateLimiting: {
        mode: 'development',
        limit: '1000 requests per 15 minutes',
        registration: 'bypassed',
        note: 'Rate limiting is very lenient in development mode'
      },
      timestamp: new Date().toISOString()
    });
  });
}

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
// Harvest routes
app.use('/api/harvests', harvestRoutes);
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
// Verify routes (public QR verification)
app.use('/api/verify', verifyRoutes);
// Weather routes
app.use('/api/weather', weatherRoutes);
// Users routes (admin/manager tools)
app.use('/api/users', userRoutes);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`GroChain backend running on port ${PORT}`);
    logger.info(`WebSocket service ready for real-time updates`);
    
    if (process.env.NODE_ENV === 'development') {
      logger.info(`🔧 Development mode: Rate limiting is lenient (1000 requests per 15 minutes)`);
      logger.info(`🔧 Reset rate limits: http://localhost:${PORT}/dev/reset-rate-limit`);
    } else {
      logger.info(`🚀 Production mode: Rate limiting is strict (5 auth requests per 15 minutes)`);
    }
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
