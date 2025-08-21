import { Request, Response } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { generateQRCode } from '../utils/qr.util';
import { Harvest } from '../models/harvest.model';
import { logger } from '../utils/logger';

export class QRCodeController {
  /**
   * Get user's QR codes
   * GET /api/qr-codes
   */
  async getUserQRCodes(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
        return;
      }

      // Get user's harvests with QR codes
      const harvests = await Harvest.find({ 
        farmer: userId,
        qrData: { $exists: true, $ne: '' }
      })
      .select('batchId cropType quantity unit harvestDate location status qrData createdAt')
      .sort({ createdAt: -1 })
      .lean();

      const qrCodes = harvests.map((harvest: any) => ({
        id: harvest._id,
        batchId: harvest.batchId,
        cropType: harvest.cropType,
        quantity: harvest.quantity,
        unit: harvest.unit,
        harvestDate: harvest.harvestDate,
        location: harvest.location,
        status: harvest.status,
        qrData: harvest.qrData,
        createdAt: harvest.createdAt,
        // Mock scan data for now - can be enhanced with real tracking
        scans: Math.floor(Math.random() * 50) + 1,
        lastScanned: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      res.status(200).json({
        status: 'success',
        message: 'QR codes retrieved successfully',
        data: qrCodes
      });

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting user QR codes');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error retrieving QR codes'
      });
    }
  }

  /**
   * Generate new QR code for existing harvest
   * POST /api/qr-codes
   */
  async generateNewQRCode(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { harvestId, customData } = req.body;
      
      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
        return;
      }

      if (!harvestId) {
        res.status(400).json({
          status: 'error',
          message: 'Harvest ID is required'
        });
        return;
      }

      // Find the harvest
      const harvest = await Harvest.findOne({ 
        _id: harvestId, 
        farmer: userId 
      });

      if (!harvest) {
        res.status(404).json({
          status: 'error',
          message: 'Harvest not found'
        });
        return;
      }

      // Generate QR code data
      let qrData: string;
      if (customData) {
        qrData = customData;
      } else {
        const locationInfo = harvest.geoLocation?.lat && harvest.geoLocation?.lng 
          ? `Lat:${harvest.geoLocation.lat.toFixed(4)},Lng:${harvest.geoLocation.lng.toFixed(4)}`
          : 'Unknown Location';
        const coordinates = harvest.geoLocation?.lat && harvest.geoLocation?.lng 
          ? `${harvest.geoLocation.lat.toFixed(6)},${harvest.geoLocation.lng.toFixed(6)}`
          : 'No Coordinates';
        
        qrData = `GROCHAIN_HARVEST_${harvest.batchId}_${harvest.cropType}_${harvest.quantity}_${locationInfo}_${coordinates}`;
      }

      // Generate QR code image
      const qrCodeImage = await generateQRCode(qrData);

      // Update harvest with new QR data
      harvest.qrData = qrData;
      await harvest.save();

      res.status(200).json({
        status: 'success',
        message: 'QR code generated successfully',
        data: {
          harvestId: harvest._id,
          batchId: harvest.batchId,
          qrData,
          qrCodeImage,
          message: 'Scan this QR code to verify harvest details'
        }
      });

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error generating QR code');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error generating QR code'
      });
    }
  }

  /**
   * Get QR code statistics
   * GET /api/qr-codes/stats
   */
  async getQRCodeStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
        return;
      }

      // Get user's harvests with QR codes
      const harvests = await Harvest.find({ 
        farmer: userId,
        qrData: { $exists: true, $ne: '' }
      }).lean();

      const totalQRCodes = harvests.length;
      const verifiedCount = harvests.filter((h: any) => h.status === 'verified').length;
      const totalScans = harvests.reduce((sum: number, h: any) => sum + (Math.floor(Math.random() * 50) + 1), 0);
      const avgScans = totalQRCodes > 0 ? Math.round(totalScans / totalQRCodes) : 0;

      res.status(200).json({
        status: 'success',
        message: 'QR code statistics retrieved successfully',
        data: {
          totalQRCodes,
          verifiedCount,
          totalScans,
          avgScans,
          verificationRate: totalQRCodes > 0 ? Math.round((verifiedCount / totalQRCodes) * 100) : 0
        }
      });

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting QR code stats');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error retrieving QR code statistics'
      });
    }
  }
}

export default new QRCodeController();
