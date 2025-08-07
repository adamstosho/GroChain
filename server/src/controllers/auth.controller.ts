import { Request, Response } from 'express';
import { User, UserRole } from '../models/user.model';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

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

export const register = async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    const { name, email, phone, password, role } = value;
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'Email or phone already registered.' });
    }
    const user = new User({ name, email, phone, password, role });
    await user.save();
    return res.status(201).json({ status: 'success', message: 'Registration successful.' });
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
    // JWT payload
    const payload = { id: user._id, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
    return res.status(200).json({
      status: 'success',
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
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
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as any;
    } catch (err) {
      return res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token.' });
    }
    // Optionally, check if user still exists and is active
    const user = await User.findById(payload.id);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ status: 'error', message: 'User not found or inactive.' });
    }
    const newAccessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    return res.status(200).json({ status: 'success', accessToken: newAccessToken });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};
