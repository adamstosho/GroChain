const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const app = express()

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))
app.use(morgan('combined'))
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Metrics
const client = require('prom-client')
client.collectDefaultMetrics()
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType)
    res.end(await client.register.metrics())
  } catch (e) {
    res.status(500).send('Metrics error')
  }
})

// Import rate limiting middleware
const rateLimitMiddleware = require('./middlewares/rateLimit.middleware')

// Apply rate limiting based on environment
if (process.env.NODE_ENV === 'development') {
  app.use('/api', rateLimitMiddleware.rateLimit('api'))
  console.log('🔧 Development mode: Using lenient rate limiting')
} else {
  app.use('/api/auth', rateLimitMiddleware.rateLimit('auth'))
  app.use('/api', rateLimitMiddleware.rateLimit('api'))
  console.log('🚀 Production mode: Using strict rate limiting')
}

// Database connection
const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('✅ MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
    return true; // Indicate successful connection
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    return false; // Indicate failed connection
  }
};

// Initialize application
const initializeApp = async () => {
  try {
    // Connect to database first
    console.log('🚀 Initializing GroChain Backend...');
    const dbConnected = await connectDB();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }
    
    // Setup routes only after database connection
    console.log('📡 Setting up API routes...');
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/users', require('./routes/user.routes'));
    app.use('/api/partners', require('./routes/partner.routes'));
    app.use('/api/farmers', require('./routes/farmer.routes'));
    app.use('/api/harvests', require('./routes/harvest.routes'));
    app.use('/api/harvest-approval', require('./routes/harvest-approval.routes'));
    app.use('/api/marketplace', require('./routes/marketplace.routes'));
    app.use('/api/fintech', require('./routes/fintech.routes'));
    app.use('/api/weather', require('./routes/weather.routes'));
    app.use('/api/analytics', require('./routes/analytics.routes'));
    app.use('/api/notifications', require('./routes/notification.routes'));
    app.use('/api/payments', require('./routes/payment.routes'));
    app.use('/api/qr-codes', require('./routes/qrCode.routes'));
    app.use('/api/verify', require('./routes/verify.routes'));
    app.use('/api/referrals', require('./routes/referral.routes'));
    app.use('/api/commissions', require('./routes/commission.routes'));
    app.use('/api/shipments', require('./routes/shipment.routes'));
    app.use('/api/export-import', require('./routes/exportImport.routes'));
    
    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'success', 
        message: 'GroChain Backend is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
      })
    });
    
    // Root endpoint
    app.get('/', (req, res) => {
      res.json({ 
        status: 'success', 
        message: 'Welcome to GroChain Backend API',
        version: '1.0.0',
        documentation: '/api/health'
      })
    });
    
    // Import error handling middleware
    const { errorHandler, notFound } = require('./middlewares/error.middleware')
    
    // 404 handler
    app.use(notFound)
    
    // Global error handler
    app.use(errorHandler)
    
    console.log('✅ Application initialized successfully');
    
    // Start the server only after everything is set up
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 GroChain Backend server listening on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/swagger.json`);
    });
    
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    process.exit(1);
  }
};

// Start the application
initializeApp();

module.exports = app

