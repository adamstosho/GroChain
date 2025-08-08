import { Router } from 'express';
import { createHarvest, getProvenance, verifyQRCode } from '../controllers/harvest.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateJWT, createHarvest);
router.get('/:batchId', authenticateJWT, getProvenance);

// Public QR verification endpoint (no authentication required)
router.get('/verify/:batchId', verifyQRCode);

export default router;
