import { Router } from 'express';
import { checkJwt, attachUser } from '../middleware/auth';
import { validateObjectId } from '../middleware/validate';
import { listApiKeys, createApiKey, revokeApiKey } from '../controllers/apiKeyController';

const router = Router();

router.get('/', checkJwt, attachUser, listApiKeys);
router.post('/', checkJwt, attachUser, createApiKey);
router.delete('/:id', checkJwt, attachUser, validateObjectId('id'), revokeApiKey);

export default router;
