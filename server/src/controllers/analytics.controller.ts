import { Request, Response } from 'express';
import { User, UserRole } from '../models/user.model';
import { Partner } from '../models/partner.model';
import { Harvest } from '../models/harvest.model';
import { Order } from '../models/order.model';
import { Referral } from '../models/referral.model';

export const overview = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: UserRole.FARMER });
    const totalPartners = await Partner.countDocuments();
    const totalHarvests = await Harvest.countDocuments();
    const totalOrders = await Order.countDocuments();
    return res.status(200).json({
      status: 'success',
      overview: {
        totalUsers,
        totalFarmers,
        totalPartners,
        totalHarvests,
        totalOrders,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const partnerAnalytics = async (req: Request, res: Response) => {
  try {
    const { partnerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const partner = await Partner.findById(partnerId).populate('onboardedFarmers');
    if (!partner) {
      return res.status(404).json({ status: 'error', message: 'Partner not found.' });
    }
    
    const totalFarmers = partner.onboardedFarmers.length;
    const totalReferrals = await Referral.countDocuments({ partner: partner._id });
    const completedReferrals = await Referral.countDocuments({ partner: partner._id, status: 'completed' });
    const totalOrders = await Order.countDocuments({ 'items.partner': partner._id });
    
    // Get paginated referrals
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const referrals = await Referral.find({ partner: partner._id })
      .populate('farmer', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));
    
    return res.status(200).json({
      status: 'success',
      analytics: {
        totalFarmers,
        totalReferrals,
        completedReferrals,
        totalOrders,
        commissionBalance: partner.commissionBalance,
      },
      referrals,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalReferrals,
        pages: Math.ceil(totalReferrals / parseInt(limit as string))
      }
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};
