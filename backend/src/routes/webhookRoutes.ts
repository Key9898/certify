import { Router } from 'express';
import { checkJwt, attachUser } from '../middleware/auth';
import { validateObjectId } from '../middleware/validate';
import { listWebhooks, createWebhook, deleteWebhook } from '../controllers/webhookController';

const router = Router();

router.get('/', checkJwt, attachUser, listWebhooks);
router.post('/', checkJwt, attachUser, createWebhook);
router.delete('/:id', checkJwt, attachUser, validateObjectId('id'), deleteWebhook);

export default router;
