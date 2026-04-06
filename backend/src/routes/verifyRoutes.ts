import { Router } from 'express';
import { verifyCertificate } from '../controllers/verifyController';

const router = Router();

// Public route — no auth required
router.get('/:certificateId', verifyCertificate);

export default router;
