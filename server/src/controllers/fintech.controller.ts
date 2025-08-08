import { Request, Response } from 'express';
import { CreditScore } from '../models/creditScore.model';
import { LoanReferral } from '../models/loanReferral.model';
import Joi from 'joi';

export const getCreditScore = async (req: Request, res: Response) => {
  try {
    const { farmerId } = req.params;
    const creditScore = await CreditScore.findOne({ farmer: farmerId });
    if (!creditScore) {
      return res.status(404).json({ status: 'error', message: 'Credit score not found.' });
    }
    return res.status(200).json({ status: 'success', creditScore });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

const loanReferralSchema = Joi.object({
  farmer: Joi.string().required(),
  amount: Joi.number().required(),
  partner: Joi.string().required(),
});

export const createLoanReferral = async (req: Request, res: Response) => {
  try {
    const { error, value } = loanReferralSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    const referral = new LoanReferral(value);
    await referral.save();
    return res.status(201).json({ status: 'success', referral });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};
