import { Router } from 'express';
import { createShipment } from '../controllers/shipment.controller';

const router = Router();

router.post('/', createShipment);

export default router;
