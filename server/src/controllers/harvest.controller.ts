import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Harvest, IHarvestPopulated } from '../models/harvest.model';
import { User, UserRole } from '../models/user.model';
import Joi from 'joi';
import { generateQRCode } from '../utils/qr.util';
import { webSocketService } from '../services/websocket.service';
import { v4 as uuidv4 } from 'uuid';

const harvestSchema = Joi.object({
  farmer: Joi.string().required(),
  cropType: Joi.string().required(),
  quantity: Joi.number().required(),
  date: Joi.date().required(),
  geoLocation: Joi.object({ lat: Joi.number().required(), lng: Joi.number().required() }).required(),
  unit: Joi.string().default('kg'),
  location: Joi.string().optional(),
  description: Joi.string().optional(),
  quality: Joi.string().valid('excellent', 'good', 'fair', 'poor').default('good'),
  images: Joi.array().items(Joi.string()).optional(),
});

export const createHarvest = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🌾 Creating harvest for user:', req.user?.id);
    console.log('🌾 Request body:', req.body);
    
    const { error, value } = harvestSchema.validate(req.body);
    if (error) {
      console.log('🌾 Validation error:', error.details[0].message);
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    
    // Ensure the farmer field is set to the authenticated user's ID
    const harvestData = {
      ...value,
      farmer: req.user?.id // Always use authenticated user's ID
    };
    
    console.log('🌾 Processed harvest data:', harvestData);
    
    const batchId = uuidv4();
    const qrData = await generateQRCode(batchId);
    
    console.log('🌾 Generated batchId:', batchId);
    console.log('🌾 Generated qrData:', qrData);
    
    const harvest = new Harvest({ ...harvestData, batchId, qrData });
    await harvest.save();
    
    console.log('🌾 Harvest saved successfully with ID:', harvest._id);

    // Send real-time notification to partner network
    try {
      if (req.user?.id) {
        const user = await User.findById(req.user.id);
        if (user && user.partner) {
          webSocketService.sendToPartnerNetwork(user.partner, 'harvest_created', {
            harvestId: harvest._id,
            farmerId: req.user.id,
            cropType: value.cropType,
            quantity: value.quantity,
            batchId,
            timestamp: new Date()
          });
        }
      }
    } catch (wsError) {
      console.error('WebSocket notification failed:', wsError);
      // Don't fail the main operation if WebSocket fails
    }

    return res.status(201).json({ status: 'success', harvest, qrData });
  } catch (err) {
    console.error('🌾 Error creating harvest:', err);
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const getHarvests = async (req: AuthRequest, res: Response) => {
  try {
    const {
      farmer,
      cropType,
      startDate,
      endDate,
      minQuantity,
      maxQuantity,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object - ALWAYS filter by authenticated user for security
    const filter: any = {};

    // IMPORTANT: Always filter by the authenticated user's ID for security
    // This ensures users can only see their own harvests
    if (req.user?.id) {
      filter.farmer = req.user.id;
    } else {
      return res.status(401).json({ 
        status: 'error', 
        message: 'User not authenticated' 
      });
    }

    // Additional filters (optional)
    if (farmer && req.user?.role === 'admin') {
      // Only admins can filter by other farmers
      filter.farmer = farmer;
    }

    // Crop type filter
    if (cropType) {
      filter.cropType = { $regex: cropType as string, $options: 'i' };
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    // Quantity range filter
    if (minQuantity || maxQuantity) {
      filter.quantity = {};
      if (minQuantity) filter.quantity.$gte = parseFloat(minQuantity as string);
      if (maxQuantity) filter.quantity.$lte = parseFloat(maxQuantity as string);
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    console.log('🔍 Harvest filter:', filter);
    console.log('🔍 Authenticated user ID:', req.user?.id);

    // Execute query with pagination
    const harvests = await Harvest.find(filter)
      .populate('farmer', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit as string));

    console.log('🔍 Found harvests:', harvests.length);

    // Get total count for pagination
    const total = await Harvest.countDocuments(filter);

    return res.status(200).json({ 
      status: 'success', 
      harvests,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (err) {
    console.error('Error fetching harvests:', err);
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const getProvenance = async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    const harvest = await Harvest.findOne({ batchId }).populate('farmer');
    if (!harvest) {
      return res.status(404).json({ status: 'error', message: 'Harvest batch not found.' });
    }
    return res.status(200).json({ status: 'success', provenance: harvest });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

// Public QR code verification endpoint (no authentication required)
export const verifyQRCode = async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    
    if (!batchId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Batch ID is required' 
      });
    }

    const harvest = await Harvest.findOne({ batchId })
      .populate('farmer', 'name email phone')
      .select('-__v') as IHarvestPopulated | null;

    if (!harvest) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Harvest batch not found or invalid QR code',
        verified: false
      });
    }

    // Return comprehensive verification data
    const verificationData = {
      verified: true,
      batchId: harvest.batchId,
      harvest: {
        cropType: harvest.cropType,
        quantity: harvest.quantity,
        date: harvest.date,
        geoLocation: harvest.geoLocation,
        createdAt: harvest.createdAt
      },
      farmer: {
        name: harvest.farmer.name,
        location: harvest.geoLocation // Approximate location for privacy
      },
      verification: {
        timestamp: new Date(),
        verifiedBy: 'GroChain QR System',
        verificationUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/api/verify/${batchId}`
      }
    };

    return res.status(200).json({
      status: 'success',
      message: 'QR Code verified successfully',
      data: verificationData
    });

  } catch (err) {
    console.error('QR verification error:', err);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Verification failed',
      verified: false
    });
  }
};
