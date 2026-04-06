import { Router } from 'express';
import { checkJwt, attachUser } from '../middleware/auth';
import { getUploadSignature } from '../controllers/uploadController';

const router = Router();

router.get('/signature', checkJwt, attachUser, getUploadSignature);

export default router;
