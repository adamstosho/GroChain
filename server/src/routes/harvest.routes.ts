import { Router } from 'express';
import { createHarvest } from '../controllers/harvest.controller';

const router = Router();

router.post('/', createHarvest);

export default router;
