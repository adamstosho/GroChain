const router = require('express').Router()
const { authenticate, authorize } = require('../middlewares/auth.middleware')
const User = require('../models/user.model')

router.get('/dashboard', authenticate, authorize('admin','partner','farmer','buyer'), async (req, res) => {
  return res.json({ status: 'success', data: { totalHarvests: 0, pendingApprovals: 0, activeListings: 0, monthlyRevenue: 0 } })
})

router.get('/profile/me', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id)
  return res.json(user)
})

router.put('/profile/me', authenticate, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true })
  return res.json(user)
})

router.get('/preferences/me', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id)
  return res.json({ notifications: user?.notificationPreferences || {} })
})

router.put('/preferences/me', authenticate, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, { notificationPreferences: req.body.notifications || {} }, { new: true })
  return res.json({ notifications: user.notificationPreferences })
})

router.get('/settings/me', authenticate, async (req, res) => {
  return res.json({})
})

router.put('/settings/me', authenticate, async (req, res) => {
  return res.json({})
})

router.post('/change-password', authenticate, async (req, res) => {
  return res.json({ status: 'success' })
})

// Admin suite
router.use(authenticate, authorize('admin'))

// List users
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, role, status, search } = req.query
  const query = {}
  if (role) query.role = role
  if (status) query.status = status
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') }
    ]
  }
  const users = await User.find(query).sort({ createdAt: -1 }).skip((page-1)*limit).limit(parseInt(limit))
  const total = await User.countDocuments(query)
  return res.json({ status: 'success', data: { users, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total/limit), totalItems: total, itemsPerPage: parseInt(limit) } } })
})

// Create user
router.post('/', async (req, res) => {
  const user = await User.create(req.body)
  return res.status(201).json({ status: 'success', data: user })
})

// Get user
router.get('/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId)
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })
  return res.json({ status: 'success', data: user })
})

// Update user
router.put('/:userId', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true })
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })
  return res.json({ status: 'success', data: user })
})

// Delete user
router.delete('/:userId', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.userId)
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })
  return res.json({ status: 'success', message: 'User deleted' })
})

// Bulk create
router.post('/bulk-create', async (req, res) => {
  const { users } = req.body || {}
  if (!Array.isArray(users) || users.length === 0) return res.status(400).json({ status: 'error', message: 'users array required' })
  const created = await User.insertMany(users, { ordered: false })
  return res.status(201).json({ status: 'success', data: { created: created.length } })
})

// Bulk update
router.put('/bulk-update', async (req, res) => {
  const { updates } = req.body || {}
  if (!Array.isArray(updates) || updates.length === 0) return res.status(400).json({ status: 'error', message: 'updates array required' })
  for (const u of updates) { await User.findByIdAndUpdate(u.id, u.data) }
  return res.json({ status: 'success', message: 'Bulk update applied' })
})

// Bulk delete
router.delete('/bulk-delete', async (req, res) => {
  const { ids } = req.body || {}
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ status: 'error', message: 'ids array required' })
  const result = await User.deleteMany({ _id: { $in: ids } })
  return res.json({ status: 'success', data: { deleted: result.deletedCount } })
})

// Search users
router.get('/search/query', async (req, res) => {
  const { q } = req.query
  const users = await User.find({ $or: [ { name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { phone: new RegExp(q, 'i') } ] }).limit(50)
  return res.json({ status: 'success', data: users })
})

// Stats & activity
router.get('/:userId/stats', async (req, res) => {
  return res.json({ status: 'success', data: { orders: 0, harvests: 0, listings: 0 } })
})

router.get('/:userId/activity', async (req, res) => {
  return res.json({ status: 'success', data: [] })
})

// Verify / suspend / reactivate / change role
router.post('/:userId/verify', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, { emailVerified: true }, { new: true })
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })
  return res.json({ status: 'success', data: user })
})

router.patch('/:userId/suspend', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, { status: 'suspended', suspendedAt: new Date(), suspensionReason: req.body?.reason }, { new: true })
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })
  return res.json({ status: 'success', data: user })
})

router.patch('/:userId/reactivate', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, { status: 'active', suspensionReason: null, suspendedAt: null }, { new: true })
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })
  return res.json({ status: 'success', data: user })
})

router.patch('/:userId/role', async (req, res) => {
  const { role } = req.body || {}
  if (!role) return res.status(400).json({ status: 'error', message: 'role required' })
  const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true })
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })
  return res.json({ status: 'success', data: user })
})

// Export users (stub)
router.post('/export', async (req, res) => {
  return res.json({ status: 'success', data: { url: null, message: 'Not yet implemented' } })
})

module.exports = router


