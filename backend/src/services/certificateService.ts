import { Certificate, ICertificateDocument } from '../models/Certificate';
import { Template } from '../models/Template';
import { generatePdf, type TemplateRenderSource } from './pdfService';
import { uploadPdf } from './cloudinaryService';
import { triggerWebhooks } from './webhookService';
import mongoose from 'mongoose';
import { getWorkspaceMemberIdsForUserId } from './workspaceService';

export interface CreateCertificateDto {
  templateId: string;
  recipientName: string;
  recipientEmail?: string;
  certificateTitle: string;
  description?: string;
  issueDate: Date;
  expiryDate?: Date;
  issuerName: string;
  issuerSignature?: string;
  organizationLogo?: string;
  customFields?: Record<string, unknown>;
  primaryColor?: string;
  secondaryColor?: string;
}

export const createCertificate = async (
  data: CreateCertificateDto,
  userId: string
): Promise<ICertificateDocument> => {
  const workspaceUserIds = await getWorkspaceMemberIdsForUserId(userId);
  const template = await Template.findOne({
    _id: data.templateId,
    $or: [{ isPublic: true }, { createdBy: { $in: workspaceUserIds } }],
  });
  if (!template) {
    const error = new Error('Template not found') as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  const certificate = new Certificate({
    ...data,
    templateId: new mongoose.Types.ObjectId(data.templateId),
    createdBy: new mongoose.Types.ObjectId(userId),
  });

  await certificate.save();

  // fire-and-forget — webhook failures must not break certificate creation
  triggerWebhooks(userId, 'certificate.created', {
    certificateId: certificate.certificateId,
    recipientName: certificate.recipientName,
    certificateTitle: certificate.certificateTitle,
  }).catch(() => {});

  return certificate;
};

export const generateAndUploadPdf = async (
  certificateId: string,
  userId: string
): Promise<string> => {
  const workspaceUserIds = await getWorkspaceMemberIdsForUserId(userId);
  const certificate = await Certificate.findOne({
    _id: certificateId,
    createdBy: { $in: workspaceUserIds },
  }).populate('templateId');

  if (!certificate) {
    const error = new Error('Certificate not found') as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  const template = certificate.templateId as unknown as TemplateRenderSource;
  const pdfData = {
    recipientName: certificate.recipientName,
    certificateTitle: certificate.certificateTitle,
    description: certificate.description,
    issueDate: certificate.issueDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    expiryDate: certificate.expiryDate
      ? certificate.expiryDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : undefined,
    issuerName: certificate.issuerName,
    issuerSignature: certificate.issuerSignature,
    organizationLogo: certificate.organizationLogo,
    primaryColor:
      (certificate.customFields?.primaryColor as string) || '#3B82F6',
    secondaryColor:
      (certificate.customFields?.secondaryColor as string) || '#64748B',
    certificateId: certificate.certificateId,
  };

  const pdfBuffer = await generatePdf(template, pdfData);
  const uploadResult = await uploadPdf(
    pdfBuffer,
    `certificate-${certificate.certificateId}`
  );

  certificate.pdfUrl = uploadResult.secure_url;
  await certificate.save();

  // fire-and-forget
  triggerWebhooks(userId, 'certificate.pdf_generated', {
    certificateId: certificate.certificateId,
    pdfUrl: certificate.pdfUrl,
  }).catch(() => {});

  return certificate.pdfUrl;
};

export const getCertificates = async (
  userId: string,
  query: { search?: string; page?: number; limit?: number }
) => {
  const { search, page = 1, limit = 12 } = query;
  const skip = (page - 1) * limit;

  const workspaceUserIds = await getWorkspaceMemberIdsForUserId(userId);
  const filter: Record<string, unknown> = {
    createdBy: { $in: workspaceUserIds },
  };

  if (search) {
    filter.$text = { $search: search };
  }

  const [certificates, total] = await Promise.all([
    Certificate.find(filter)
      .populate('templateId', 'name thumbnail category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Certificate.countDocuments(filter),
  ]);

  return {
    certificates,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
