const router = require('express').Router()
const ctrl = require('../controllers/auth.controller')
const Joi = require('joi')

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) return res.status(400).json({ status: 'error', message: error.details[0].message })
    next()
  }
}

router.post('/register', ctrl.register)
router.post('/verify-email', ctrl.verifyEmail)
router.post('/login', ctrl.login)
router.post('/refresh', ctrl.refresh)
router.post('/logout', ctrl.logout)
router.post('/forgot-password', ctrl.forgotPassword)
router.post('/reset-password', ctrl.resetPassword)
router.post('/resend-verification', ctrl.resendVerification)

module.exports = router

