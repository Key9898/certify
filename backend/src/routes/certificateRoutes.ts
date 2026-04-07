import { Router } from 'express';
import { checkJwt, attachUser } from '../middleware/auth';
import { validateObjectId } from '../middleware/validate';
import { pdfLimiter } from '../middleware/rateLimiter';
import {
  listCertificates,
  getCertificate,
  createCertificateHandler,
  generatePdfHandler,
  generatePngHandler,
  deleteCertificate,
  revokeCertificate,
} from '../controllers/certificateController';

const router = Router();

router.get('/', checkJwt, attachUser, listCertificates);
router.get('/:id', checkJwt, attachUser, validateObjectId('id'), getCertificate);
router.post('/', checkJwt, attachUser, createCertificateHandler);
router.post(
  '/generate-pdf/:id',
  checkJwt,
  attachUser,
  validateObjectId('id'),
  pdfLimiter,
  generatePdfHandler
);
router.post(
  '/generate-png/:id',
  checkJwt,
  attachUser,
  validateObjectId('id'),
  pdfLimiter,
  generatePngHandler
);
router.patch('/:id/revoke', checkJwt, attachUser, validateObjectId('id'), revokeCertificate);
router.delete('/:id', checkJwt, attachUser, validateObjectId('id'), deleteCertificate);

export default router;
