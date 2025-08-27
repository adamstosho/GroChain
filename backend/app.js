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
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err))

// Routes
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/users', require('./routes/user.routes'))
app.use('/api/partners', require('./routes/partner.routes'))
app.use('/api/farmers', require('./routes/farmer.routes'))
app.use('/api/harvests', require('./routes/harvest.routes'))
app.use('/api/harvest-approval', require('./routes/harvest-approval.routes'))
app.use('/api/marketplace', require('./routes/marketplace.routes'))
app.use('/api/fintech', require('./routes/fintech.routes'))
app.use('/api/weather', require('./routes/weather.routes'))
app.use('/api/analytics', require('./routes/analytics.routes'))
app.use('/api/notifications', require('./routes/notification.routes'))
app.use('/api/payments', require('./routes/payment.routes'))
app.use('/api/qr-codes', require('./routes/qrCode.routes'))
app.use('/api/verify', require('./routes/verify.routes'))
app.use('/api/referrals', require('./routes/referral.routes'))
app.use('/api/shipments', require('./routes/shipment.routes'))
app.use('/api/export-import', require('./routes/exportImport.routes'))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'GroChain Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Welcome to GroChain Backend API',
    version: '1.0.0',
    documentation: '/api/health'
  })
})

// Import error handling middleware
const { errorHandler, notFound } = require('./middlewares/error.middleware')

// 404 handler
app.use(notFound)

// Global error handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`JS backend listening on port ${PORT}`)
})

module.exports = app

