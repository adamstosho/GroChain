import { Request, Response } from 'express';
import { User, UserRole } from '../models/user.model';
import { Partner } from '../models/partner.model';
import { Referral } from '../models/referral.model';
import { sendBulkSMSInvitations, sendSMS } from '../services/notification.service';
import Joi from 'joi';
import csv from 'csv-parser';
import { Readable } from 'stream';
import mongoose from 'mongoose';

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
      return res.status(400).json({ 
        status: 'error', 
        message: 'No CSV file uploaded.',
        code: 'MISSING_FILE'
      });
    }

    const { partnerId } = req.body;
    if (!partnerId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Partner ID is required.',
        code: 'MISSING_PARTNER_ID'
      });
    }

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Partner not found.',
        code: 'PARTNER_NOT_FOUND'
      });
    }

    const farmers: any[] = [];
    const validationErrors: Array<{ row: number; field: string; value: string; message: string }> = [];
    const stream = Readable.from(req.file.buffer);
    let rowNumber = 0;
    
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => {
          rowNumber++;
          
          // Enhanced validation with detailed feedback
          const errors: string[] = [];
          
          // Check required fields
          if (!row.name || !row.name.trim()) {
            errors.push('Name is required');
          } else if (row.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
          }
          
          if (!row.email || !row.email.trim()) {
            errors.push('Email is required');
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
            errors.push('Invalid email format');
          }
          
          if (!row.phone || !row.phone.trim()) {
            errors.push('Phone number is required');
          } else if (!/^(\+?234|0)?[789][01]\d{8}$/.test(row.phone.trim())) {
            errors.push('Invalid Nigerian phone number format');
          }
          
          // Check password if provided
          if (row.password && row.password.trim().length < 6) {
            errors.push('Password must be at least 6 characters');
          }
          
          // If there are validation errors, add them to the list
          if (errors.length > 0) {
            errors.forEach(error => {
              let field: string = 'general';
              if (error.includes('Name')) field = 'name';
              else if (error.includes('Email')) field = 'email';
              else if (error.includes('Phone')) field = 'phone';
              else if (error.includes('Password')) field = 'password';

              validationErrors.push({
                row: rowNumber,
                field,
                value: JSON.stringify(row),
                message: error
              });
            });
            return; // Skip this row
          }
          
          // Generate a secure default password if not provided
          const password = row.password || `GroChain${Math.random().toString(36).substring(2, 8)}${Math.random().toString(36).substring(2, 8)}`;
          
          farmers.push({
            name: row.name.trim(),
            email: row.email.trim().toLowerCase(),
            phone: row.phone.trim(),
            password: password,
            rowNumber: rowNumber
          });
        })
        .on('end', resolve)
        .on('error', (error) => {
          reject(new Error(`CSV parsing error at row ${rowNumber}: ${error.message}`));
        });
    });

    // If there are validation errors, return them without processing
    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'CSV validation failed',
        code: 'VALIDATION_ERROR',
        validationErrors,
        summary: {
          totalRows: rowNumber,
          validRows: farmers.length,
          invalidRows: validationErrors.length
        }
      });
    }

    if (farmers.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No valid farmer data found in CSV.',
        code: 'NO_VALID_DATA'
      });
    }

    // Check for duplicate emails/phones before processing
    const duplicateCheck = await User.find({
      $or: [
        { email: { $in: farmers.map(f => f.email) } },
        { phone: { $in: farmers.map(f => f.phone) } }
      ]
    });

    const duplicates = duplicateCheck.map(user => ({
      email: user.email,
      phone: user.phone,
      existingUserId: user._id
    }));

    // Process the farmers using enhanced error handling
    const onboarded: Array<{ email: string; userId: string; rowNumber: number }> = [];
    const failed: Array<{ email: string; phone: string; reason: string; rowNumber: number }> = [];
    const skipped: Array<{ email: string; phone: string; reason: string; rowNumber: number }> = [];

    for (const farmer of farmers) {
      try {
        // Check if user already exists
        const exists = await User.findOne({ 
          $or: [{ email: farmer.email }, { phone: farmer.phone }] 
        });
        
        if (exists) {
          skipped.push({ 
            email: farmer.email, 
            phone: farmer.phone, 
            reason: 'Email or phone already registered.',
            rowNumber: farmer.rowNumber
          });
          continue;
        }

        // Create user with enhanced error handling
        const user = new User({ 
          ...farmer, 
          role: UserRole.FARMER,
          status: 'active',
          createdAt: new Date()
        });

        // Validate user before saving
        await user.validate();
        await user.save();

        // Update partner's onboarded farmers list
        partner.onboardedFarmers.push(user._id as any);
        
        // Create referral record
        await Referral.create({ 
          farmer: user._id, 
          partner: partner._id, 
          status: 'pending', 
          commission: 0,
          createdAt: new Date()
        });

        onboarded.push({ 
          email: farmer.email, 
          userId: (user._id as mongoose.Types.ObjectId).toString(),
          rowNumber: farmer.rowNumber
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        failed.push({ 
          email: farmer.email, 
          phone: farmer.phone, 
          reason: `User creation failed: ${errorMessage}`,
          rowNumber: farmer.rowNumber
        });
      }
    }

    // Save partner updates
    await partner.save();

    // Send SMS invitations to successfully onboarded farmers
    const successfulFarmers = farmers.filter(f => 
      onboarded.some(o => o.email === f.email)
    );
    
    const smsResults = await sendBulkSMSInvitations(successfulFarmers);

    // Prepare detailed response
    const response = {
      status: 'success',
      message: `CSV processing completed`,
      code: 'SUCCESS',
      summary: {
        totalRows: rowNumber,
        validRows: farmers.length,
        onboarded: onboarded.length,
        failed: failed.length,
        skipped: skipped.length,
        smsSent: smsResults.filter(r => r.success).length,
        smsFailed: smsResults.filter(r => !r.success).length
      },
      details: {
        onboarded,
        failed,
        skipped,
        smsResults
      }
    };

    // Return appropriate status code based on results
    if (failed.length > 0 && onboarded.length === 0) {
      return res.status(400).json({
        ...response,
        status: 'partial_success',
        message: 'All farmer records failed to process'
      });
    } else if (failed.length > 0) {
      return res.status(207).json({
        ...response,
        status: 'partial_success',
        message: 'Some farmer records failed to process'
      });
    } else {
      return res.status(201).json(response);
    }

  } catch (error) {
    console.error('CSV upload error:', error);
    
    // Enhanced error handling with specific error codes
    let errorCode = 'INTERNAL_ERROR';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('CSV parsing error')) {
        errorCode = 'CSV_PARSE_ERROR';
        statusCode = 400;
      } else if (error.message.includes('validation')) {
        errorCode = 'VALIDATION_ERROR';
        statusCode = 400;
      }
    }
    
    return res.status(statusCode).json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Error processing CSV file.',
      code: errorCode,
      timestamp: new Date().toISOString()
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
      
      // Send SMS invite to onboarded farmer
      try {
        await sendSMS(farmer.phone, `Welcome to GroChain, ${farmer.name}! Your account has been created successfully. You can now access the platform and start your digital farming journey.`);
      } catch (smsError) {
        console.error('Failed to send SMS invite:', smsError);
        // Continue with the process even if SMS fails
      }
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
