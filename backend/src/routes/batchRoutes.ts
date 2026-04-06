import { Router } from 'express';
import { checkJwt, attachUser } from '../middleware/auth';
import { csvUpload } from '../middleware/upload';
import { uploadBatch, startBatch, getBatchStatus, downloadBatchZip } from '../controllers/batchController';

const router = Router();

router.post('/upload', checkJwt, attachUser, csvUpload, uploadBatch);
router.post('/generate', checkJwt, attachUser, startBatch);
router.get('/:id/status', checkJwt, attachUser, getBatchStatus);
router.get('/:id/download-zip', checkJwt, attachUser, downloadBatchZip);

export default router;
