import rateLimit from 'express-rate-limit';

// Log rate limiting configuration on startup
console.log(`📊 Rate Limiting Configuration:`);
console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   - Auth endpoints: ${process.env.NODE_ENV === 'development' ? '50' : '5'} requests per 15 minutes`);
console.log(`   - General API: ${process.env.NODE_ENV === 'development' ? '1000' : '100'} requests per 15 minutes`);
console.log(`   - File uploads: ${process.env.NODE_ENV === 'development' ? '100' : '10'} uploads per hour`);

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Add helpful logging for development
  handler: (req, res) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚫 Rate limit exceeded for ${req.ip} on ${req.path}`);
    }
    res.status(429).json({
      status: 'error',
      message: 'Too many requests from this IP, please try again later.',
      limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      windowMs: '15 minutes',
      remaining: 0,
      resetTime: new Date(Date.now() + parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000')).toISOString()
    });
  }
});

// Stricter rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50 : 5, // More lenient in development
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development for easier testing
  skip: (req) => {
    if (process.env.NODE_ENV === 'development' && req.path === '/register') {
      console.log(`🔓 Skipping rate limit for registration in development mode`);
      return true;
    }
    return false;
  },
  // Add helpful logging for development
  handler: (req, res) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚫 Auth rate limit exceeded for ${req.ip} on ${req.path}`);
    }
    res.status(429).json({
      status: 'error',
      message: 'Too many authentication attempts, please try again later.',
      limit: process.env.NODE_ENV === 'development' ? 50 : 5,
      windowMs: '15 minutes',
      remaining: 0,
      resetTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });
  }
});

// Rate limiter for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'development' ? 100 : 10, // More lenient in development
  message: {
    status: 'error',
    message: 'Too many file uploads, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Development-friendly rate limiter
export const devLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Very high limit for development
  message: {
    status: 'error',
    message: 'Rate limit exceeded in development mode.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Only apply in development
  skip: (req) => {
    if (process.env.NODE_ENV !== 'development') {
      return true;
    }
    // Log when rate limiting is applied in development
    console.log(`🔒 Applying dev rate limit to ${req.path} (${req.ip})`);
    return false;
  },
  // Add helpful headers for development
  handler: (req, res) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚫 Dev rate limit exceeded for ${req.ip} on ${req.path}`);
    }
    res.status(429).json({
      status: 'error',
      message: 'Rate limit exceeded in development mode.',
      limit: 1000,
      windowMs: '15 minutes',
      remaining: 0,
      resetTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });
  },
  // Add helpful logging when rate limiting is applied
  skipFailedRequests: false
});
