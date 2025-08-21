import { Request, Response } from 'express';
import { User, UserRole } from '../models/user.model';
import Joi from 'joi';
import { sign, verify } from 'jsonwebtoken';
import { sendEmail } from '../utils/email.util';

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid(...Object.values(UserRole)).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    const { name, email, phone, password, role } = value;
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'email already exists' });
    }
    
    // Generate email verification token
    const verificationToken = sign(
      { email, type: 'email_verification' },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );
    
    const user = new User({ 
      name, 
      email, 
      phone, 
      password, 
      role,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 86400000) // 24 hours
    });
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    const emailContent = `
      <h2>Welcome to GroChain!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering with GroChain. Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
        Verify Email
      </a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create this account, please ignore this email.</p>
      <p>Best regards,<br>GroChain Team</p>
    `;

    await sendEmail({
      to: email,
      subject: 'Verify your GroChain account',
      html: emailContent,
      fromName: 'GroChain'
    });
    
    // Don't issue JWT tokens - user must verify email first
    return res.status(201).json({ 
      status: 'success', 
      message: 'Registration successful! Please check your email to verify your account before logging in.',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      requiresVerification: true
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Please verify your email address before logging in. Check your email for a verification link or request a new one.',
        requiresVerification: true,
        email: user.email
      });
    }

    // JWT payload
    const payload = { id: user._id, role: user.role } as any;
    const accessExpiresIn = (process.env.JWT_EXPIRES_IN ?? '24h') as unknown as number | string;
    const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ?? '30d') as unknown as number | string;
    const accessToken = sign(payload, process.env.JWT_SECRET as string, { expiresIn: accessExpiresIn as any });
    const refreshToken = sign(payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: refreshExpiresIn as any });
    
    // Set non-httpOnly cookie for frontend middleware compatibility
    try {
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      res.cookie('auth_token', accessToken, {
        httpOnly: false, // Allow JavaScript access
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: maxAge,
      })
    } catch {}

    return res.status(200).json({
      status: 'success',
      // Backward compatible fields
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      // New standardized envelope used by some tests/clients
      data: {
        accessToken,
        refreshToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { error, value } = refreshSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    const { refreshToken } = value;
    let payload;
    try {
      payload = verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as any;
    } catch (err) {
      return res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token.' });
    }
    // Optionally, check if user still exists and is active
    const user = await User.findById(payload.id);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ status: 'error', message: 'User not found or inactive.' });
    }
    const accessExpiresIn = (process.env.JWT_EXPIRES_IN ?? '24h') as unknown as number | string;
    const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ?? '30d') as unknown as number | string;
    const newAccessToken = sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: accessExpiresIn as any });
    const newRefreshToken = sign({ id: user._id, role: user.role }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: refreshExpiresIn as any });
    
    // Set non-httpOnly cookie for frontend middleware compatibility
    try {
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      res.cookie('auth_token', newAccessToken, {
        httpOnly: false, // Allow JavaScript access
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: maxAge,
      })
    } catch {}
    
    return res.status(200).json({ status: 'success', accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    const { email } = value;
    
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ 
        status: 'success', 
        message: 'If the email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = sign(
      { id: user._id, type: 'password_reset' },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    // Store reset token in user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const emailContent = `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>You requested a password reset for your GroChain account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
        Reset Password
      </a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>GroChain Team</p>
    `;

    // Send password reset email
    try {
      await sendEmail({
        to: email,
        subject: 'GroChain - Password Reset Request',
        html: emailContent,
        fromName: 'GroChain Support'
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue with the response even if email fails
    }
    
    return res.status(200).json({ 
      status: 'success', 
      message: 'If the email exists, a password reset link has been sent.' 
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    const { token, password } = value;

    // Verify token
    let payload;
    try {
      payload = verify(token, process.env.JWT_SECRET as string) as any;
    } catch (err) {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired reset token.' });
    }

    if (payload.type !== 'password_reset') {
      return res.status(400).json({ status: 'error', message: 'Invalid token type.' });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(400).json({ status: 'error', message: 'User not found.' });
    }

    if (user.resetPasswordToken !== token) {
      return res.status(400).json({ status: 'error', message: 'Invalid reset token.' });
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ status: 'error', message: 'Reset token has expired.' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ 
      status: 'success', 
      message: 'Password has been reset successfully.' 
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { error, value } = verifyEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    const { token } = value;

    // Verify token
    let payload;
    try {
      payload = verify(token, process.env.JWT_SECRET as string) as any;
    } catch (err) {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired verification token.' });
    }

    if (payload.type !== 'email_verification') {
      return res.status(400).json({ status: 'error', message: 'Invalid token type.' });
    }

    const user = await User.findOne({ email: payload.email });
    if (!user) {
      return res.status(400).json({ status: 'error', message: 'User not found.' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ status: 'error', message: 'Email is already verified.' });
    }

    if (user.emailVerificationToken !== token) {
      return res.status(400).json({ status: 'error', message: 'Invalid verification token.' });
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ status: 'error', message: 'Verification token has expired.' });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.status(200).json({ 
      status: 'success', 
      message: 'Email verified successfully. You can now log in to your account.' 
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ 
        status: 'success', 
        message: 'If the email exists, a new verification link has been sent.' 
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({ status: 'error', message: 'Email is already verified.' });
    }

    // Generate new verification token
    const verificationToken = sign(
      { email, type: 'email_verification' },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    // Update user with new token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 86400000); // 24 hours
    await user.save();

    // Send new verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    const emailContent = `
      <h2>Email Verification - GroChain</h2>
      <p>Hello ${user.name},</p>
      <p>You requested a new email verification link for your GroChain account.</p>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
        Verify Email
      </a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>GroChain Team</p>
    `;

    await sendEmail({
      to: email,
      subject: 'New Email Verification - GroChain',
      html: emailContent,
      fromName: 'GroChain'
    });
    
    return res.status(200).json({ 
      status: 'success', 
      message: 'If the email exists, a new verification link has been sent.' 
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

// SMS OTP functions
export const sendSmsOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found with this phone number.' });
    }

    // Check OTP attempt limits
    if (user.smsOtpAttempts && user.smsOtpAttempts >= 5) {
      const lastAttempt = user.smsOtpExpires;
      if (lastAttempt && lastAttempt > new Date(Date.now() - 60 * 60 * 1000)) { // 1 hour cooldown
        return res.status(429).json({ 
          status: 'error', 
          message: 'Too many OTP attempts. Please try again in 1 hour.' 
        });
      }
      // Reset attempts after cooldown
      user.smsOtpAttempts = 0;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.smsOtpToken = otp;
    user.smsOtpExpires = otpExpires;
    user.smsOtpAttempts = (user.smsOtpAttempts || 0) + 1;
    await user.save();

    // Send SMS via notification service
    const message = `Your GroChain verification code is: ${otp}. Valid for 10 minutes.`;
    try {
      const { sendSMS } = await import('../services/notification.service');
      await sendSMS(phone, message);
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      // In development, log the OTP
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] SMS OTP for ${phone}: ${otp}`);
      }
    }

    return res.status(200).json({ 
      status: 'success', 
      message: 'SMS OTP sent successfully.' 
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const verifySmsOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    
    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    // Check if OTP exists and is valid
    if (!user.smsOtpToken || !user.smsOtpExpires) {
      return res.status(400).json({ status: 'error', message: 'No OTP found. Please request a new one.' });
    }

    // Check if OTP has expired
    if (user.smsOtpExpires < new Date()) {
      return res.status(400).json({ status: 'error', message: 'OTP has expired. Please request a new one.' });
    }

    // Check if OTP matches
    if (user.smsOtpToken !== otp) {
      return res.status(400).json({ status: 'error', message: 'Invalid OTP.' });
    }

    // Mark phone as verified and clear OTP
    user.phoneVerified = true;
    user.smsOtpToken = undefined;
    user.smsOtpExpires = undefined;
    user.smsOtpAttempts = 0;
    await user.save();

    return res.status(200).json({ 
      status: 'success', 
      message: 'Phone number verified successfully.' 
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};
