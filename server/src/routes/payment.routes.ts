import { Router } from 'express';
import { initializeOrderPayment, verifyPaymentWebhook } from '../controllers/payment.controller';

const router = Router();

router.post('/initialize', initializeOrderPayment);
router.post('/verify', verifyPaymentWebhook);

export default router;
