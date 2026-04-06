import { Router } from 'express';
import { checkJwt, attachUser } from '../middleware/auth';
import { validateObjectId } from '../middleware/validate';
import {
  createIntegration,
  deleteIntegration,
  getIntegrationHookInfo,
  listIntegrationCatalog,
  listIntegrations,
  receiveIntegrationWebhook,
  testIntegration,
  updateIntegration,
} from '../controllers/integrationController';

const router = Router();

router.get('/hooks/:webhookKey', getIntegrationHookInfo);
router.post('/hooks/:webhookKey', receiveIntegrationWebhook);

router.use(checkJwt, attachUser);

router.get('/catalog', listIntegrationCatalog);
router.get('/', listIntegrations);
router.post('/', createIntegration);
router.patch('/:id', validateObjectId('id'), updateIntegration);
router.post('/:id/test', validateObjectId('id'), testIntegration);
router.delete('/:id', validateObjectId('id'), deleteIntegration);

export default router;
