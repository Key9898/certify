import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  createCertificate,
  generateAndUploadPdf,
  getCertificates,
} from '../services/certificateService';
import { generatePng, type TemplateRenderSource } from '../services/pdfService';
import { Certificate } from '../models/Certificate';
import {
  canManageWorkspaceResource,
  getWorkspaceMemberIds,
} from '../services/workspaceService';

export const listCertificates = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { search, page, limit } = req.query;

    const result = await getCertificates(userId, {
      search: search as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 12,
    });

    res.json({
      success: true,
      data: result.certificates,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getCertificate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const workspaceUserIds = await getWorkspaceMemberIds(req.user!);
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      createdBy: { $in: workspaceUserIds },
    }).populate('templateId');

    if (!certificate) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Certificate not found' },
      });
      return;
    }

    res.json({ success: true, data: certificate });
  } catch (error) {
    next(error);
  }
};

export const createCertificateHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const certificate = await createCertificate(
      req.body,
      req.user!._id.toString()
    );
    res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    next(error);
  }
};

export const generatePdfHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pdfUrl = await generateAndUploadPdf(
      req.params.id,
      req.user!._id.toString()
    );
    res.json({ success: true, data: { pdfUrl } });
  } catch (error) {
    next(error);
  }
};

export const generatePngHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const workspaceUserIds = await getWorkspaceMemberIds(req.user!);
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      createdBy: { $in: workspaceUserIds },
    }).populate('templateId');

    if (!certificate) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Certificate not found' },
      });
      return;
    }

    const template = certificate.templateId as unknown as TemplateRenderSource;
    const pngData = {
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

    const pngBuffer = await generatePng(template, pngData);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificate-${certificate.certificateId}.png"`
    );
    res.send(pngBuffer);
  } catch (error) {
    next(error);
  }
};

export const revokeCertificate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const workspaceUserIds = await getWorkspaceMemberIds(req.user!);
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      createdBy: { $in: workspaceUserIds },
    });

    if (!certificate) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Certificate not found' },
      });
      return;
    }

    const canManage = await canManageWorkspaceResource(
      req.user!,
      certificate.createdBy
    );
    if (!canManage) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You cannot revoke this team certificate.',
        },
      });
      return;
    }

    certificate.status = 'revoked';
    await certificate.save();

    res.json({
      success: true,
      data: { message: 'Certificate revoked successfully' },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCertificate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const workspaceUserIds = await getWorkspaceMemberIds(req.user!);
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      createdBy: { $in: workspaceUserIds },
    });

    if (!certificate) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Certificate not found' },
      });
      return;
    }

    const canManage = await canManageWorkspaceResource(
      req.user!,
      certificate.createdBy
    );
    if (!canManage) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You cannot delete this team certificate.',
        },
      });
      return;
    }

    await certificate.deleteOne();

    res.json({
      success: true,
      data: { message: 'Certificate deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
};
