import { Request, Response } from 'express';
import { User, UserRole } from '../models/user.model';
import { Partner } from '../models/partner.model';
import { Referral } from '../models/referral.model';
import { sendBulkSMSInvitations } from '../services/notification.service';
import Joi from 'joi';
import csv from 'csv-parser';
import { Readable } from 'stream';

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

// CSV Upload for bulk farmer onboarding
export const uploadCSVAndOnboard = async (req: Request & { file?: any }, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No CSV file uploaded.' });
    }

    const { partnerId } = req.body;
    if (!partnerId) {
      return res.status(400).json({ status: 'error', message: 'Partner ID is required.' });
    }

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ status: 'error', message: 'Partner not found.' });
    }

    const farmers: any[] = [];
    const stream = Readable.from(req.file.buffer);
    
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => {
          // Validate required fields
          if (!row.name || !row.email || !row.phone) {
            reject(new Error(`Missing required fields in CSV row: ${JSON.stringify(row)}`));
            return;
          }
          
          // Generate a default password if not provided
          const password = row.password || `GroChain${Math.random().toString(36).substring(2, 8)}`;
          
          farmers.push({
            name: row.name.trim(),
            email: row.email.trim().toLowerCase(),
            phone: row.phone.trim(),
            password: password
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (farmers.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No valid farmer data found in CSV.' });
    }

    // Process the farmers using existing bulkOnboard logic
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
        partner.onboardedFarmers.push(user._id as any);
        await Referral.create({ farmer: user._id, partner: partner._id, status: 'pending', commission: 0 });
        onboarded.push(farmer.email);
      } catch (err) {
        failed.push({ email: farmer.email, reason: 'Error creating user.' });
      }
    }

    await partner.save();

    // Send SMS invitations to successfully onboarded farmers
    const successfulFarmers = farmers.filter(f => onboarded.includes(f.email));
    const smsResults = await sendBulkSMSInvitations(successfulFarmers);

    return res.status(201).json({
      status: 'success',
      message: `Processed ${farmers.length} farmers from CSV`,
      onboarded,
      failed,
      smsResults,
      summary: {
        total: farmers.length,
        successful: onboarded.length,
        failed: failed.length,
        smsSent: smsResults.filter(r => r.success).length
      }
    });

  } catch (error) {
    console.error('CSV upload error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: (error as Error).message || 'Error processing CSV file.' 
    });
  }
};

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
      partner.onboardedFarmers.push(user._id as any);
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

export const getPartnerMetrics = async (req: Request, res: Response) => {
  try {
    const partner = await Partner.findById(req.params.id).populate('onboardedFarmers');
    if (!partner) {
      return res.status(404).json({ status: 'error', message: 'Partner not found.' });
    }

    // Basic metrics
    const totalFarmers = partner.onboardedFarmers.length;
    const activeFarmers = (partner.onboardedFarmers as any[]).filter(f => f.status === 'active').length;
    const totalReferrals = await Referral.countDocuments({ partner: partner._id });
    const completedReferrals = await Referral.countDocuments({ partner: partner._id, status: 'completed' });

    // Enhanced analytics - Revenue tracking
    const referrals = await Referral.find({ partner: partner._id }).populate('farmer');
    const totalRevenue = referrals.reduce((sum, ref) => sum + (ref.commission || 0), 0);
    const monthlyRevenue = referrals
      .filter(ref => {
        const refDate = new Date(ref.createdAt);
        const now = new Date();
        return refDate.getMonth() === now.getMonth() && refDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, ref) => sum + (ref.commission || 0), 0);

    // Farmer engagement metrics
    const recentActivity = await Referral.find({ 
      partner: partner._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    }).countDocuments();

    const farmerEngagement = {
      totalFarmers,
      activeFarmers,
      inactiveFarmers: totalFarmers - activeFarmers,
      engagementRate: totalFarmers > 0 ? (activeFarmers / totalFarmers * 100).toFixed(2) : 0,
      recentActivity
    };

    // Commission breakdown
    const commissionBreakdown = {
      totalEarned: totalRevenue,
      monthlyEarned: monthlyRevenue,
      pendingCommissions: await Referral.aggregate([
        { $match: { partner: partner._id, status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$commission' } } }
      ]).then(result => result[0]?.total || 0),
      completedCommissions: await Referral.aggregate([
        { $match: { partner: partner._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$commission' } } }
      ]).then(result => result[0]?.total || 0)
    };

    // Performance trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrends = await Referral.aggregate([
      { $match: { partner: partner._id, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$commission' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top performing farmers
    const topFarmers = await Referral.aggregate([
      { $match: { partner: partner._id, status: 'completed' } },
      {
        $group: {
          _id: '$farmer',
          totalCommissions: { $sum: '$commission' },
          referralCount: { $sum: 1 }
        }
      },
      { $sort: { totalCommissions: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'farmerDetails'
        }
      }
    ]);

    return res.status(200).json({
      status: 'success',
      metrics: {
        // Basic metrics
        totalFarmers,
        activeFarmers,
        totalReferrals,
        completedReferrals,
        commissionBalance: partner.commissionBalance,
        
        // Enhanced metrics
        farmerEngagement,
        commissionBreakdown,
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue,
          averagePerFarmer: totalFarmers > 0 ? (totalRevenue / totalFarmers).toFixed(2) : 0
        },
        
        // Trends and analytics
        monthlyTrends,
        topFarmers: topFarmers.map(farmer => ({
          name: farmer.farmerDetails[0]?.name || 'Unknown',
          totalCommissions: farmer.totalCommissions,
          referralCount: farmer.referralCount
        })),
        
        // Performance indicators
        performance: {
          conversionRate: totalReferrals > 0 ? (completedReferrals / totalReferrals * 100).toFixed(2) : 0,
          averageCommission: completedReferrals > 0 ? (commissionBreakdown.completedCommissions / completedReferrals).toFixed(2) : 0,
          monthlyGrowth: monthlyTrends.length >= 2 ? 
            ((monthlyTrends[monthlyTrends.length - 1]?.revenue || 0) - (monthlyTrends[monthlyTrends.length - 2]?.revenue || 0)).toFixed(2) : 0
        }
      },
    });
  } catch (err) {
    console.error('Partner metrics error:', err);
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};
