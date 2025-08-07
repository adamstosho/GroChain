import { Router } from 'express';
import { bulkOnboard, getPartnerMetrics } from '../controllers/partner.controller';

const router = Router();

router.post('/bulk-onboard', bulkOnboard);
router.get('/:id/metrics', getPartnerMetrics);

export default router;
