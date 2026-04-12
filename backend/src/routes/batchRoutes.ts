import { Router } from 'express';
import { checkJwt, attachUser } from '../middleware/auth';
import { csvUpload } from '../middleware/upload';
import { batchLimiter } from '../middleware/rateLimiter';
import {
  uploadBatch,
  startBatch,
  getBatchStatus,
  downloadBatchZip,
} from '../controllers/batchController';

const router = Router();

router.post(
  '/upload',
  checkJwt,
  attachUser,
  batchLimiter,
  csvUpload,
  uploadBatch
);
router.post('/generate', checkJwt, attachUser, batchLimiter, startBatch);
router.get('/:id/status', checkJwt, attachUser, getBatchStatus);
router.get('/:id/download-zip', checkJwt, attachUser, downloadBatchZip);

export default router;
