import { Router } from 'express';
import { checkJwt, attachUser } from '../middleware/auth';
import { validateObjectId } from '../middleware/validate';
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../controllers/templateController';

const router = Router();

router.get('/', checkJwt, attachUser, listTemplates);
router.get('/:id', checkJwt, attachUser, validateObjectId('id'), getTemplate);
router.post('/', checkJwt, attachUser, createTemplate);
router.put('/:id', checkJwt, attachUser, validateObjectId('id'), updateTemplate);
router.delete('/:id', checkJwt, attachUser, validateObjectId('id'), deleteTemplate);

export default router;
