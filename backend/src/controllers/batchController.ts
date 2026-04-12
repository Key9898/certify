import archiver from 'archiver';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { parseCsv, validateBatchData } from '../utils/csvParser';
import {
  createBatchJob,
  processBatchJob,
  getBatchJob,
} from '../services/batchService';
import { logger } from '../utils/logger';

export const uploadBatch = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'No file uploaded.' },
      });
      return;
    }

    const rows = await parseCsv(req.file.buffer, {
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
    });
    const { valid, errors } = validateBatchData(rows);

    if (!valid) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message:
            'Import validation failed. Please check the file format and required columns.',
          details: errors,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        total: rows.length,
        preview: rows.slice(0, 5),
        rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const startBatch = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { templateId, data } = req.body as {
      templateId?: string;
      data?: Record<string, string>[];
    };

    if (!templateId || !data || !Array.isArray(data) || data.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'templateId and data array are required.',
        },
      });
      return;
    }

    const userId = req.user!._id.toString();
    const job = await createBatchJob(templateId, data, userId);

    processBatchJob((job._id as { toString(): string }).toString()).catch(
      (err: unknown) => {
        logger.error('BatchController', 'Batch job processing error', err);
      }
    );

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const downloadBatchZip = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const job = await getBatchJob(req.params.id, userId);

    if (!job) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Batch job not found.' },
      });
      return;
    }

    if (job.status !== 'completed') {
      res.status(400).json({
        success: false,
        error: {
          code: 'NOT_READY',
          message: 'Batch job is not completed yet.',
        },
      });
      return;
    }

    const pdfEntries = job.results.filter(
      (r): r is typeof r & { pdfUrl: string } =>
        r.status === 'success' &&
        typeof r.pdfUrl === 'string' &&
        r.pdfUrl.length > 0
    );

    if (pdfEntries.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NO_PDFS',
          message: 'No generated PDFs found in this batch.',
        },
      });
      return;
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="batch-${job._id}-certificates.zip"`
    );

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.on('error', (err) => {
      next(err);
    });
    archive.pipe(res);

    await Promise.all(
      pdfEntries.map(async (entry, index) => {
        try {
          const response = await fetch(entry.pdfUrl, {
            signal: AbortSignal.timeout(15000),
          });
          if (!response.ok) return;
          const buffer = Buffer.from(await response.arrayBuffer());
          const safeName = entry.recipientName
            .replace(/[^a-z0-9_\- ]/gi, '_')
            .trim();
          archive.append(buffer, { name: `${index + 1}-${safeName}.pdf` });
        } catch {
          // skip unreachable PDFs silently
        }
      })
    );

    await archive.finalize();
  } catch (error) {
    next(error);
  }
};

export const getBatchStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const job = await getBatchJob(req.params.id, userId);

    if (!job) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Batch job not found.' },
      });
      return;
    }

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};
