import { Router } from 'express';
import { overview, partnerAnalytics } from '../controllers/analytics.controller';

const router = Router();

router.get('/overview', overview);
router.get('/partner/:partnerId', partnerAnalytics);

export default router;
