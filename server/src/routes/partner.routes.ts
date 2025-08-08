import { Router } from 'express';
import { bulkOnboard, getPartnerMetrics, uploadCSVAndOnboard } from '../controllers/partner.controller';
import multer from 'multer';

const router = Router();

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

router.post('/bulk-onboard', bulkOnboard);
router.post('/upload-csv', upload.single('csvFile'), uploadCSVAndOnboard);
router.get('/:id/metrics', getPartnerMetrics);

export default router;
