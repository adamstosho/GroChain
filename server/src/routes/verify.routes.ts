import { Router } from 'express';
import { verifyQRCode } from '../controllers/harvest.controller';

const router = Router();

// Public QR verification endpoint (no authentication required)
// This matches the spec requirement: GET /api/verify/:batchId
router.get('/:batchId', verifyQRCode);

export default router;


