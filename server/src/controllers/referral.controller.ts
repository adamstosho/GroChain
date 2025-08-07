import { Request, Response } from 'express';
import { Referral } from '../models/referral.model';

export const completeReferral = async (req: Request, res: Response) => {
  try {
    const { farmerId } = req.params;
    const referral = await Referral.findOne({ farmer: farmerId, status: 'pending' });
    if (!referral) {
      return res.status(404).json({ status: 'error', message: 'Pending referral not found for this farmer.' });
    }
    referral.status = 'completed';
    referral.commission = 100; // Example: set commission to ₦100 (can be dynamic)
    await referral.save();
    return res.status(200).json({ status: 'success', referral });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};
