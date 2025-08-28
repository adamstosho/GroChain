const { verifyAccess } = require('../utils/jwt')

function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    
    const decoded = verifyAccess(token)
    
    // Create a basic user object from JWT data
    // This avoids async database calls that might be causing issues
    req.user = { 
      id: decoded.id, 
      role: decoded.role,
      email: decoded.email || 'user@example.com', // Will be overridden by actual user data
      name: decoded.name || 'User',               // Will be overridden by actual user data
      phone: undefined,
      location: undefined
    }
    
    next()
  } catch (e) {
    console.error('Auth middleware error:', e);
    return res.status(401).json({ status: 'error', message: 'Invalid token' })
  }
}

function authorizeRoles(...roles) {
  // Support both authorize('a','b') and authorize(['a','b'])
  const allowed = Array.isArray(roles[0]) ? roles[0] : roles
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' })
    }
    next()
  }
}

module.exports = { 
  authenticate, 
  authorize: authorizeRoles 
}


