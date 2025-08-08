import { Router } from 'express';
import { getCreditScore, createLoanReferral } from '../controllers/fintech.controller';

const router = Router();

router.get('/credit-score/:farmerId', getCreditScore);
router.post('/loan-referrals', createLoanReferral);

export default router;
