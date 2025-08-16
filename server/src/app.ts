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
import weatherRoutes from './routes/weather.routes';
import websocketRoutes from './routes/websocket.routes';
import bvnVerificationRoutes from './routes/bvnVerification.routes';
import ussdRoutes from './routes/ussd.routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import { errorHandler } from './middlewares/error.middleware';
import { apiLimiter, authLimiter } from './middlewares/rateLimit.middleware';
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
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Raw body parser for payment webhooks (must come before JSON parser)
// Skip in test environment so Supertest JSON bodies are parsed normally
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/payments/verify', express.raw({ type: 'application/json' }));
}

// Security middleware
app.use(helmet());
app.use(sanitizeRequest);

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

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
app.use('/api/referrals', referralRoutes);
app.use('/api/harvests', harvestRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/fintech', fintechRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/commission', commissionRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/pwa', pwaRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/language', languageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/image-recognition', imageRecognitionRoutes);
app.use('/api/advanced-ml', advancedMLRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/websocket', websocketRoutes);
app.use('/api/verification', bvnVerificationRoutes);
app.use('/api/ussd', ussdRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware
app.use(errorHandler);

// Note: Wildcard route removed due to Express 5 compatibility issues
// 404 errors will be handled by the error handler middleware

export default app;
