const router = require('express').Router()
const { authenticate, authorize } = require('../middlewares/auth.middleware')
const User = require('../models/user.model')

router.get('/dashboard', authenticate, authorize('admin','partner','farmer','buyer'), async (req, res) => {
  // Minimal dashboard stats for farmer
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

module.exports = router


