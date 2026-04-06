import { Router } from 'express';
import { checkJwt, attachUser } from '../middleware/auth';
import { getAnalytics } from '../controllers/analyticsController';

const router = Router();

router.get('/', checkJwt, attachUser, getAnalytics);

export default router;
