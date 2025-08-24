import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { 
  getPendingHarvests, 
  approveHarvest, 
  rejectHarvest, 
  createListingFromHarvest 
} from '../controllers/harvest-approval.controller';
import Joi from 'joi';

const router = Router();

// Get pending harvests for approval (Partners & Admins only)
router.get('/pending', 
  authenticate, 
  authorize(['partner', 'admin']), 
  getPendingHarvests
);

// Approve a harvest (Partners & Admins only)
router.patch('/:harvestId/approve',
  authenticate,
  authorize(['partner', 'admin']),
  validateRequest(Joi.object({
    quality: Joi.string().valid('excellent', 'good', 'fair', 'poor').optional(),
    notes: Joi.string().optional()
  })),
  approveHarvest
);

// Reject a harvest (Partners & Admins only)
router.patch('/:harvestId/reject',
  authenticate,
  authorize(['partner', 'admin']),
  validateRequest(Joi.object({
    rejectionReason: Joi.string().required().min(10).max(500)
  })),
  rejectHarvest
);

// Create marketplace listing from approved harvest (Farmers only)
router.post('/:harvestId/create-listing',
  authenticate,
  authorize(['farmer']),
  validateRequest(Joi.object({
    price: Joi.number().positive().required(),
    description: Joi.string().optional().max(1000)
  })),
  createListingFromHarvest
);

export default router;
