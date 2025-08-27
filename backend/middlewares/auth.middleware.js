const { verifyAccess } = require('../utils/jwt')

function authenticateJWT(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    const decoded = verifyAccess(token)
    req.user = { id: decoded.id, role: decoded.role }
    next()
  } catch (e) {
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
  authenticate: authenticateJWT, 
  authorize: authorizeRoles 
}


