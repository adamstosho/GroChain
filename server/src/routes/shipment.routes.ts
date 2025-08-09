import { Router } from 'express';
import { createShipment } from '../controllers/shipment.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';

const router = Router();

router.post('/', authenticateJWT, authorizeRoles('aggregator', 'partner', 'admin'), createShipment);

export default router;
