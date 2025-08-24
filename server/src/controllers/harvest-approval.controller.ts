import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Harvest } from '../models/harvest.model';
import { User } from '../models/user.model';
import { Listing } from '../models/listing.model';
import { webSocketService } from '../services/websocket.service';

// Get pending harvests for approval
export const getPendingHarvests = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 Getting pending harvests for user:', req.user?.id);
    
    // Check if user is partner or admin
    if (!req.user || (req.user.role !== 'partner' && req.user.role !== 'admin')) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Only partners and admins can view pending harvests' 
      });
    }

    // Get pending harvests
    const pendingHarvests = await Harvest.find({ 
      status: 'pending' 
    }).populate('farmer', 'name email phone location');

    console.log('🔍 Found pending harvests:', pendingHarvests.length);

    return res.status(200).json({
      status: 'success',
      data: pendingHarvests
    });
  } catch (error) {
    console.error('🔍 Error getting pending harvests:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server error' 
    });
  }
};

// Approve a harvest
export const approveHarvest = async (req: AuthRequest, res: Response) => {
  try {
    const { harvestId } = req.params;
    const { quality, notes } = req.body;

    console.log('🔍 Approving harvest:', harvestId, 'by user:', req.user?.id);

    if (!req.user || (req.user.role !== 'partner' && req.user.role !== 'admin')) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Only partners and admins can approve harvests' 
      });
    }

    // Find and update harvest
    const harvest = await Harvest.findByIdAndUpdate(
      harvestId,
      {
        status: 'approved',
        verifiedBy: req.user.id,
        verifiedAt: new Date(),
        quality: quality || 'good'
      },
      { new: true }
    ).populate('farmer', 'name email phone');

    if (!harvest) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Harvest not found' 
      });
    }

    console.log('🔍 Harvest approved:', harvest.batchId);

    // Send notification to farmer
    try {
      webSocketService.sendToUser(harvest.farmer._id.toString(), 'harvest_approved', {
        harvestId: harvest._id,
        batchId: harvest.batchId,
        cropType: harvest.cropType,
        quality: harvest.quality,
        verifiedBy: req.user?.name,
        verifiedAt: harvest.verifiedAt
      });
    } catch (wsError) {
      console.error('WebSocket notification failed:', wsError);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Harvest approved successfully',
      data: harvest
    });
  } catch (error) {
    console.error('🔍 Error approving harvest:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server error' 
    });
  }
};

// Reject a harvest
export const rejectHarvest = async (req: AuthRequest, res: Response) => {
  try {
    const { harvestId } = req.params;
    const { rejectionReason } = req.body;

    console.log('🔍 Rejecting harvest:', harvestId, 'by user:', req.user?.id);

    if (!req.user || (req.user.role !== 'partner' && req.user.role !== 'admin')) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Only partners and admins can reject harvests' 
      });
    }

    if (!rejectionReason) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Rejection reason is required' 
      });
    }

    // Find and update harvest
    const harvest = await Harvest.findByIdAndUpdate(
      harvestId,
      {
        status: 'rejected',
        verifiedBy: req.user.id,
        verifiedAt: new Date(),
        rejectionReason
      },
      { new: true }
    ).populate('farmer', 'name email phone');

    if (!harvest) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Harvest not found' 
      });
    }

    console.log('🔍 Harvest rejected:', harvest.batchId);

    // Send notification to farmer
    try {
      webSocketService.sendToUser(harvest.farmer._id.toString(), 'harvest_rejected', {
        harvestId: harvest._id,
        batchId: harvest.batchId,
        cropType: harvest.cropType,
        rejectionReason: harvest.rejectionReason,
        rejectedBy: req.user?.name,
        rejectedAt: harvest.verifiedAt
      });
    } catch (wsError) {
      console.error('WebSocket notification failed:', wsError);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Harvest rejected successfully',
      data: harvest
    });
  } catch (error) {
    console.error('🔍 Error rejecting harvest:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server error' 
    });
  }
};

// Create marketplace listing from approved harvest
export const createListingFromHarvest = async (req: AuthRequest, res: Response) => {
  try {
    const { harvestId } = req.params;
    const { price, description } = req.body;

    console.log('🔍 Creating listing from harvest:', harvestId);

    if (!req.user || req.user.role !== 'farmer') {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Only farmers can create listings' 
      });
    }

    // Find the approved harvest
    const harvest = await Harvest.findOne({ 
      _id: harvestId, 
      farmer: req.user.id, 
      status: 'approved' 
    });

    if (!harvest) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Approved harvest not found' 
      });
    }

    // Check if listing already exists
    const existingListing = await Listing.findOne({ 
      harvest: harvestId 
    });

    if (existingListing) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Listing already exists for this harvest' 
      });
    }

    // Create new listing
    const listing = new Listing({
      product: harvest.cropType,
      price: price || 0,
      quantity: harvest.quantity,
      farmer: harvest.farmer,
      partner: req.user.partner, // If farmer has a partner
      images: harvest.images || [],
      description: description || harvest.description || '',
      harvest: harvestId, // Reference to the harvest
      status: 'active'
    });

    await listing.save();

    console.log('🔍 Listing created:', listing._id);

    // Update harvest status to 'listed'
    await Harvest.findByIdAndUpdate(harvestId, { 
      status: 'listed' 
    });

    return res.status(201).json({
      status: 'success',
      message: 'Listing created successfully',
      data: listing
    });
  } catch (error) {
    console.error('🔍 Error creating listing from harvest:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server error' 
    });
  }
};
