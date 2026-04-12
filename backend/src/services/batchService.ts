import mongoose from 'mongoose';
import {
  BatchJob,
  type IBatchJobDocument,
  type IBatchJobIntegrationContext,
} from '../models/BatchJob';
import { Template } from '../models/Template';
import { createCertificate, generateAndUploadPdf } from './certificateService';
import { sendCertificateEmail } from './emailService';
import { triggerWebhooks } from './webhookService';
import { getWorkspaceMemberIdsForUserId } from './workspaceService';
import { syncBatchJobNativeResults } from './nativeIntegrationService';

export const createBatchJob = async (
  templateId: string,
  data: Record<string, string>[],
  userId: string,
  integrationContext?: IBatchJobIntegrationContext
): Promise<IBatchJobDocument> => {
  const workspaceUserIds = await getWorkspaceMemberIdsForUserId(userId);
  const template = await Template.findOne({
    _id: templateId,
    $or: [{ isPublic: true }, { createdBy: { $in: workspaceUserIds } }],
  });
  if (!template) {
    const error = new Error('Template not found') as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  const job = new BatchJob({
    templateId: new mongoose.Types.ObjectId(templateId),
    status: 'pending',
    totalCertificates: data.length,
    processedCertificates: 0,
    data,
    results: [],
    createdBy: new mongoose.Types.ObjectId(userId),
    integrationContext,
  });

  await job.save();
  return job;
};

const processBatch = async (
  rows: Record<string, string>[],
  templateId: string,
  userId: string
) => {
  const results = [];

  for (const row of rows) {
    try {
      const certificate = await createCertificate(
        {
          templateId,
          recipientName: row.recipientName,
          recipientEmail: row.recipientEmail,
          certificateTitle: row.certificateTitle,
          description: row.description,
          issueDate: new Date(row.issueDate),
          expiryDate: row.expiryDate ? new Date(row.expiryDate) : undefined,
          issuerName: row.issuerName,
        },
        userId
      );

      let pdfUrl: string | undefined;
      try {
        pdfUrl = await generateAndUploadPdf(
          (certificate._id as mongoose.Types.ObjectId).toString(),
          userId
        );
      } catch {
        // PDF generation failure should not fail the whole row
      }

      if (pdfUrl && row.recipientEmail) {
        try {
          await sendCertificateEmail(
            row.recipientEmail,
            row.recipientName,
            row.certificateTitle,
            pdfUrl
          );
        } catch {
          // Email failure should not fail the whole row
        }
      }

      results.push({
        recipientName: row.recipientName,
        status: 'success' as const,
        certificateId: certificate._id as mongoose.Types.ObjectId,
        publicCertificateId: certificate.certificateId,
        pdfUrl,
      });
    } catch (err) {
      results.push({
        recipientName: row.recipientName,
        status: 'failed' as const,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return results;
};

export const processBatchJob = async (jobId: string): Promise<void> => {
  const job = await BatchJob.findById(jobId);
  if (!job) return;

  job.status = 'processing';
  await job.save();

  const userId = job.createdBy.toString();

  try {
    const CHUNK_SIZE = 5;
    const templateId = job.templateId.toString();
    const allResults: typeof job.results = [];

    for (let i = 0; i < job.data.length; i += CHUNK_SIZE) {
      const chunk = job.data.slice(i, i + CHUNK_SIZE);
      const chunkResults = await processBatch(chunk, templateId, userId);

      allResults.push(...(chunkResults as typeof job.results));
      job.processedCertificates = Math.min(i + CHUNK_SIZE, job.data.length);
      job.results = allResults;
      await job.save();
    }

    const hasFailed = allResults.some((r) => r.status === 'failed');
    job.status =
      hasFailed && allResults.every((r) => r.status === 'failed')
        ? 'failed'
        : 'completed';
    await job.save();

    await syncBatchJobNativeResults(job).catch((error) => {
      console.warn('Batch native sync failed:', error);
    });

    triggerWebhooks(userId, 'batch.completed', {
      jobId: job._id,
      total: job.totalCertificates,
      succeeded: allResults.filter((r) => r.status === 'success').length,
      failed: allResults.filter((r) => r.status === 'failed').length,
    }).catch(() => {});
  } catch (err) {
    job.status = 'failed';
    job.errorMessage =
      err instanceof Error ? err.message : 'Unexpected error during processing';
    await job.save();

    triggerWebhooks(userId, 'batch.failed', {
      jobId: job._id,
      error: job.errorMessage,
    }).catch(() => {});
  }
};

export const getBatchJob = async (
  jobId: string,
  userId: string
): Promise<IBatchJobDocument | null> => {
  const workspaceUserIds = await getWorkspaceMemberIdsForUserId(userId);
  return BatchJob.findOne({
    _id: jobId,
    createdBy: { $in: workspaceUserIds },
  });
};
