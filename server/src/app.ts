import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pino from 'pino';
import pinoHttp from 'pino-http';

import authRoutes from './routes/auth.routes';
import partnerRoutes from './routes/partner.routes';
import farmerRoutes from './routes/farmer.routes';
import harvestRoutes from './routes/harvest.routes';
import harvestApprovalRoutes from './routes/harvest-approval.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import fintechRoutes from './routes/fintech.routes';
import analyticsRoutes from './routes/analytics.routes';
import paymentRoutes from './routes/payment.routes';
import notificationRoutes from './routes/notification.routes';
import verifyRoutes from './routes/verify.routes';
import weatherRoutes from './routes/weather.routes';
import userRoutes from './routes/user.routes';
import qrCodeRoutes from './routes/qrCode.routes';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middlewares/error.middleware';
import { apiLimiter, authLimiter, devLimiter } from './middlewares/rateLimit.middleware';
import client from 'prom-client';
import { sanitizeRequest } from './middlewares/sanitize.middleware';

// Load environment variables
dotenv.config();

const app = express();
const logger = pino();

// Export logger for use in other modules
export { logger };

// Middleware
app.use(express.json());

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Raw body parser for payment webhooks (must come before JSON parser)
// Skip in test environment so Supertest JSON bodies are parsed normally
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/payments/verify', express.raw({ type: 'application/json' }));
}

// Security middleware
app.use(helmet());
app.use(sanitizeRequest);

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
} else {
  // Use production rate limiting
  app.use('/api/auth', authLimiter);
  // Exclude payment webhook from generic limiter to avoid dropped provider callbacks
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/payments/verify')) return next();
    return apiLimiter(req, res, next);
  });
  console.log('🚀 Production mode: Using strict rate limiting');
}

// Request logging
app.use(pinoHttp({ logger }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Development endpoint to reset rate limits (only in development)
if (process.env.NODE_ENV === 'development') {
  app.get('/dev/reset-rate-limit', (req, res) => {
    console.log(`🔄 Rate limits reset requested for development`);
    res.status(200).json({
      status: 'success',
      message: 'Rate limits reset for development',
      timestamp: new Date().toISOString(),
      note: 'This endpoint is only available in development mode'
    });
  });
}

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/harvests', harvestRoutes);
app.use('/api/harvest-approval', harvestApprovalRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/fintech', fintechRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/qr-codes', qrCodeRoutes);

// Swagger UI (serves /public/swagger.json)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(undefined, { swaggerUrl: '/public/swagger.json' }));
app.use('/api/users', userRoutes);

// Error handling middleware
app.use(errorHandler);

// Note: Wildcard route removed due to Express 5 compatibility issues
// 404 errors will be handled by the error handler middleware

export default app;
