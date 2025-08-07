import { Request, Response } from 'express';
import { User, UserRole } from '../models/user.model';
import Joi from 'joi';

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid(...Object.values(UserRole)).optional(), // Now includes 'buyer'
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
