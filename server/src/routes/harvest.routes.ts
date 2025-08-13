import { Router } from 'express';
import { createHarvest, getHarvests, getProvenance, verifyQRCode } from '../controllers/harvest.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validateRequest, validateQuery } from '../middlewares/validation.middleware';
import Joi from 'joi';

const router = Router();

router.get(
  '/',
  authenticateJWT,
  validateQuery(
    Joi.object({
      farmer: Joi.string().optional(),
      cropType: Joi.string().optional(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      minQuantity: Joi.number().optional(),
      maxQuantity: Joi.number().optional(),
      sortBy: Joi.string().optional(),
      sortOrder: Joi.string().valid('asc', 'desc').optional(),
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
    })
  ),
  getHarvests
);

router.post(
  '/',
  authenticateJWT,
  validateRequest(
    Joi.object({
      farmer: Joi.string().required(),
      cropType: Joi.string().required(),
      quantity: Joi.number().required(),
      date: Joi.date().required(),
      geoLocation: Joi.object({ lat: Joi.number().required(), lng: Joi.number().required() }).required(),
    })
  ),
  createHarvest
);

// Route alias to match spec: GET /api/harvests/:batchId
router.get('/:batchId', authenticateJWT, getProvenance);

router.get('/provenance/:batchId', authenticateJWT, getProvenance);

// Public QR verification endpoint (no authentication required)
router.get('/verify/:batchId', verifyQRCode);

export default router;
