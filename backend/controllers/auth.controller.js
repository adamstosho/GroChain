const Joi = require('joi')
const User = require('../models/user.model')
const { signAccess, signRefresh, verifyRefresh } = require('../utils/jwt')
const nodemailer = require('nodemailer')
// crypto is built-in to Node.js, no need to require it

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('admin','partner','farmer','buyer').default('farmer'),
  location: Joi.string().optional(),
}).unknown(true)

const tempTokens = new Map()

async function sendEmail(to, subject, html) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('[dev-email]', { to, subject, html })
    return
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE) === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, html })
}

exports.register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body)
    if (error) return res.status(400).json({ status: 'error', message: error.details[0].message })
    
    // Check if user already exists
    const exists = await User.findOne({ email: value.email })
    if (exists) return res.status(409).json({ status: 'error', message: 'Email already exists' })
    
    const user = await User.create(value)
    const token = require('crypto').randomBytes(32).toString('hex')
    tempTokens.set(token, { id: user._id, email: user.email, exp: Date.now() + 1000 * 60 * 60 })
    
    // For development, auto-verify email
    if (process.env.NODE_ENV === 'development') {
      await User.findByIdAndUpdate(user._id, { emailVerified: true })
      user.emailVerified = true
    } else {
      await sendEmail(user.email, 'Verify your email', `<p>Click to verify: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}</p>`)
    }
    
    return res.status(201).json({ 
      status: 'success', 
      requiresVerification: !user.emailVerified, 
      user: { _id: user._id, email: user.email, role: user.role } 
    })
  } catch (e) {
    console.error('Registration error:', e)
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.verifyEmail = async (req, res) => {
  const { token } = req.body || {}
  if (!token) return res.status(400).json({ status: 'error', message: 'Token required' })
  const entry = tempTokens.get(token)
  if (!entry || entry.exp < Date.now()) return res.status(400).json({ status: 'error', message: 'Invalid or expired token' })
  const user = await User.findByIdAndUpdate(entry.id, { emailVerified: true }, { new: true })
  tempTokens.delete(token)
  return res.json({ status: 'success', message: 'Email verified', user })
}

exports.login = async (req, res) => {
  const { email, password } = req.body || {}
  const user = await User.findOne({ email })
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ status: 'error', message: 'Invalid credentials' })
  }
  if (!user.emailVerified && process.env.NODE_ENV !== 'development' && String(process.env.DISABLE_EMAIL) !== 'true') {
    return res.status(403).json({ status: 'error', message: 'Email not verified' })
  }
  const accessToken = signAccess({ id: String(user._id), role: user.role })
  const refreshToken = signRefresh({ id: String(user._id), role: user.role })
  return res.json({ status: 'success', data: { user, accessToken, refreshToken } })
}

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body || {}
    if (!email) return res.status(400).json({ status: 'error', message: 'Email required' })
    const user = await User.findOne({ email })
    if (!user) return res.json({ status: 'success', message: 'If account exists, email sent' })
    if (user.emailVerified) return res.json({ status: 'success', message: 'Email already verified' })
    const token = require('crypto').randomBytes(32).toString('hex')
    tempTokens.set(token, { id: user._id, email: user.email, exp: Date.now() + 1000 * 60 * 60 })
    await sendEmail(user.email, 'Verify your email', `<p>Click to verify: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}</p>`)
    return res.json({ status: 'success', message: 'Verification email sent' })
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body || {}
    if (!refreshToken) return res.status(400).json({ status: 'error', message: 'refreshToken required' })
    const decoded = verifyRefresh(refreshToken)
    const accessToken = signAccess({ id: decoded.id, role: decoded.role })
    const newRefreshToken = signRefresh({ id: decoded.id, role: decoded.role })
    return res.json({ status: 'success', data: { accessToken, refreshToken: newRefreshToken } })
  } catch (e) {
    return res.status(401).json({ status: 'error', message: 'Invalid refresh token' })
  }
}

exports.logout = async (req, res) => {
  return res.json({ status: 'success', message: 'Logged out' })
}

exports.forgotPassword = async (req, res) => {
  // Stubbed - integrate later
  return res.json({ status: 'success', message: 'If account exists, email sent' })
}

exports.resetPassword = async (req, res) => {
  // Stubbed - integrate later
  return res.json({ status: 'success', message: 'Password reset' })
}

