import { Router } from 'express';
import { bulkOnboard } from '../controllers/partner.controller';

const router = Router();

router.post('/bulk-onboard', bulkOnboard);

export default router;
