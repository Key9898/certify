import { Router } from 'express';
import { checkJwt, attachUser } from '../middleware/auth';
import { getMe, syncUser } from '../controllers/authController';

const router = Router();

router.get('/me', checkJwt, attachUser, getMe);
router.post('/sync', checkJwt, syncUser);

export default router;
