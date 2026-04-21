/**
 * @swagger
 * tags:
 *   - name: v1/Certificates
 *     description: Public API — Certificate operations (requires API key)
 *   - name: v1/Templates
 *     description: Public API — Template operations (requires API key)
 */
import { Router } from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { generalLimiter } from '../middleware/rateLimiter';
import { validateObjectId } from '../middleware/validate';
import { Certificate } from '../models/Certificate';
import { Template } from '../models/Template';
import {
  createCertificate,
  generateAndUploadPdf,
} from '../services/certificateService';
import { AuthenticatedRequest } from '../types';
import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';

const router = Router();

// All v1 routes require API key auth + rate limiting
router.use(generalLimiter);
router.use(apiKeyAuth);

/**
 * @swagger
 * /api/v1/certificates:
 *   get:
 *     summary: List certificates
 *     tags: [v1/Certificates]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: List of certificates
 */
router.get(
  '/certificates',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt((req.query.page as string) || '1'));
      const limit = Math.min(
        100,
        Math.max(1, parseInt((req.query.limit as string) || '20'))
      );
      const skip = (page - 1) * limit;
      const userId = new mongoose.Types.ObjectId(req.user!._id.toString());

      const [certificates, total] = await Promise.all([
        Certificate.find({ createdBy: userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Certificate.countDocuments({ createdBy: userId }),
      ]);

      res.json({
        success: true,
        data: certificates,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/certificates/{id}:
 *   get:
 *     summary: Get a certificate by ID
 *     tags: [v1/Certificates]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Certificate object
 *       404:
 *         description: Not found
 */
router.get(
  '/certificates/:id',
  validateObjectId('id'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const certificate = await Certificate.findOne({
        _id: req.params.id,
        createdBy: req.user!._id,
      });
      if (!certificate) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Certificate not found.' },
        });
        return;
      }
      res.json({ success: true, data: certificate });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/certificates:
 *   post:
 *     summary: Create a certificate
 *     tags: [v1/Certificates]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [templateId, recipientName, certificateTitle, issuerName, issueDate]
 *             properties:
 *               templateId: { type: string }
 *               recipientName: { type: string }
 *               recipientEmail: { type: string }
 *               certificateTitle: { type: string }
 *               issuerName: { type: string }
 *               issueDate: { type: string, format: date }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Certificate created
 */
router.post(
  '/certificates',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const certificate = await createCertificate(
        req.body,
        req.user!._id.toString()
      );
      res.status(201).json({ success: true, data: certificate });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/certificates/{id}/generate-pdf:
 *   post:
 *     summary: Generate PDF for a certificate
 *     tags: [v1/Certificates]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF URL
 */
router.post(
  '/certificates/:id/generate-pdf',
  validateObjectId('id'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const pdfUrl = await generateAndUploadPdf(
        req.params.id,
        req.user!._id.toString()
      );
      res.json({ success: true, data: { pdfUrl } });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/templates:
 *   get:
 *     summary: List public templates
 *     tags: [v1/Templates]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of templates
 */
router.get('/templates', async (_req, res: Response, next: NextFunction) => {
  try {
    const templates = await Template.find({ isPublic: true }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
});

export default router;
