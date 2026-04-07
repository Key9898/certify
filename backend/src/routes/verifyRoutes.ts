import { Router } from 'express';
import { verifyCertificate } from '../controllers/verifyController';
import { verifyLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public route — no auth required
router.get('/:certificateId', verifyLimiter, verifyCertificate);

export default router;
