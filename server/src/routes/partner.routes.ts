import { Router } from 'express';
import { bulkOnboard, getPartnerMetrics, uploadCSVAndOnboard, getAllPartners, getPartnerById, createPartner, updatePartner, deletePartner, onboardSingleFarmer } from '../controllers/partner.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import Joi from 'joi';
import multer from 'multer';

const router = Router();

// Test endpoint - no authentication required
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Partner routes are working!',
    data: {
      timestamp: new Date().toISOString()
    }
  });
});

// Configure multer for CSV upload
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Single farmer onboarding endpoint
router.post(
  '/onboard-farmer',
  authenticateJWT,
  authorizeRoles('partner', 'admin'),
        validateRequest(
        Joi.object({
          partnerId: Joi.string().required(),
          farmer: Joi.object({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            email: Joi.string().email().required(),
            phone: Joi.string().required(),
            state: Joi.string().required(),
            lga: Joi.string().required(),
            address: Joi.string().optional(),
            farmSize: Joi.number().optional(),
            cropTypes: Joi.string().optional(),
            experience: Joi.number().optional(),
            notes: Joi.string().optional(),
            organization: Joi.string().optional(),
          }).required(),
        })
      ),
  onboardSingleFarmer
);

router.post(
  '/bulk-onboard',
  authenticateJWT,
  authorizeRoles('partner', 'admin'),
  validateRequest(
    Joi.object({
      partnerId: Joi.string().required(),
      farmers: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
          phone: Joi.string().required(),
          password: Joi.string().min(6).required(),
        })
      ).min(1).required(),
    })
  ),
  bulkOnboard
);
router.post(
  '/upload-csv',
  authenticateJWT,
  authorizeRoles('partner', 'admin'),
  upload.single('csvFile'),
  uploadCSVAndOnboard
);
// Get all partners - temporarily allow all authenticated users for testing
router.get('/', authenticateJWT, getAllPartners);

// Get partner by ID
router.get('/:id', authenticateJWT, authorizeRoles('partner', 'admin'), getPartnerById);

// Create new partner
router.post('/', authenticateJWT, authorizeRoles('admin'), createPartner);

// Update partner
router.put('/:id', authenticateJWT, authorizeRoles('admin'), updatePartner);

// Delete partner
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), deletePartner);

// Get partner metrics
router.get('/:id/metrics', authenticateJWT, authorizeRoles('partner', 'admin'), getPartnerMetrics);

export default router;
