import { Request, Response } from 'express';
import { User, UserRole } from '../models/user.model';
import { Partner } from '../models/partner.model';
import { Referral } from '../models/referral.model';
import Joi from 'joi';

const farmerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

const bulkOnboardSchema = Joi.object({
  partnerId: Joi.string().required(),
  farmers: Joi.array().items(farmerSchema).min(1).required(),
});

export const bulkOnboard = async (req: Request, res: Response) => {
  const { error, value } = bulkOnboardSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: 'error', message: error.details[0].message });
  }
  const { partnerId, farmers } = value;
  const partner = await Partner.findById(partnerId);
  if (!partner) {
    return res.status(404).json({ status: 'error', message: 'Partner not found.' });
  }
  const onboarded: string[] = [];
  const failed: { email: string; reason: string }[] = [];
  for (const farmer of farmers) {
    try {
      const exists = await User.findOne({ $or: [{ email: farmer.email }, { phone: farmer.phone }] });
      if (exists) {
        failed.push({ email: farmer.email, reason: 'Email or phone already registered.' });
        continue;
      }
      const user = new User({ ...farmer, role: UserRole.FARMER });
      await user.save();
      partner.onboardedFarmers.push(user._id);
      await Referral.create({ farmer: user._id, partner: partner._id, status: 'pending', commission: 0 });
      onboarded.push(farmer.email);
      // TODO: Send SMS invite here
    } catch (err) {
      failed.push({ email: farmer.email, reason: 'Error creating user.' });
    }
  }
  await partner.save();
  return res.status(201).json({ status: 'success', onboarded, failed });
};
