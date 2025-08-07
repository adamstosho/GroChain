import { Router } from 'express';
import { getListings, createOrder } from '../controllers/marketplace.controller';

const router = Router();

router.get('/listings', getListings);
router.post('/orders', createOrder);

export default router;
