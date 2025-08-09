import { Router } from 'express';
import { createHarvest, getHarvests, getProvenance, verifyQRCode } from '../controllers/harvest.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, getHarvests);
router.post('/', authenticateJWT, createHarvest);
router.get('/provenance/:batchId', authenticateJWT, getProvenance);

// Public QR verification endpoint (no authentication required)
router.get('/verify/:batchId', verifyQRCode);

export default router;
