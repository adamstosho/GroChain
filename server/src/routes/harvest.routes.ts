import { Router } from 'express';
import { createHarvest, getProvenance } from '../controllers/harvest.controller';

const router = Router();

router.post('/', createHarvest);
router.get('/:batchId', getProvenance);

export default router;
