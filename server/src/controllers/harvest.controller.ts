import { Request, Response } from 'express';
import { Harvest } from '../models/harvest.model';
import { generateQRCode } from '../utils/qr.util';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

const harvestSchema = Joi.object({
  farmer: Joi.string().required(),
  cropType: Joi.string().required(),
  quantity: Joi.number().required(),
  date: Joi.date().required(),
  geoLocation: Joi.object({ lat: Joi.number().required(), lng: Joi.number().required() }).required(),
});

export const createHarvest = async (req: Request, res: Response) => {
  try {
    const { error, value } = harvestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    const batchId = uuidv4();
    const qrData = await generateQRCode(batchId);
    const harvest = new Harvest({ ...value, batchId, qrData });
    await harvest.save();
    return res.status(201).json({ status: 'success', harvest, qrData });
  } catch (err) {
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
      .select('-__v');

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
