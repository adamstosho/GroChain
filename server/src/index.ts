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
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import { errorHandler } from './middlewares/error.middleware';
import { apiLimiter, authLimiter } from './middlewares/rateLimit.middleware';

// Load environment variables
dotenv.config();

const app = express();
const logger = pino();

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

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(pinoHttp({ logger }));

// Serve static files
app.use('/public', express.static('public'));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
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
