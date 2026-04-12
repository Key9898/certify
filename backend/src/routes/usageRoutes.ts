import { Router } from 'express';
import { getUsageStats } from '../controllers/usageController';
import { checkJwt, attachUser } from '../middleware/auth';

const router = Router();

router.get('/', checkJwt, attachUser, getUsageStats);

export default router;
