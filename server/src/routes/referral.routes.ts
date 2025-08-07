import { Router } from 'express';
import { completeReferral } from '../controllers/referral.controller';

const router = Router();

router.post('/:farmerId/complete', completeReferral);

export default router;
